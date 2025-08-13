%%%-------------------------------------------------------------------
%% @doc 인증 모듈 - JWT 토큰 검증 및 Redis 연동
%% @end
%%%-------------------------------------------------------------------

-module(auth_module).

-export([
    init/0,
    validate_token/1,
    extract_token_from_cookie/1,
    verify_token_in_redis/1,
    get_user_session/1,
    refresh_tokens/1,
    cleanup/0
]).

%% 환경 변수에서 설정 가져오기
get_jwt_secret() ->
    case os:getenv("JWT_SECRET") of
        false -> <<"contestapp-super-secret-jwt-key-2024-auth-server">>;  % auth-server와 동일한 기본값
        Secret -> list_to_binary(Secret)
    end.

get_redis_host() ->
    case os:getenv("REDIS_HOST") of
        false -> "contestapp-redis";  % 기본값
        Host -> Host
    end.

get_redis_port() ->
    case os:getenv("REDIS_PORT") of
        false -> 6379;  % 기본값
        PortStr -> list_to_integer(PortStr)
    end.

%% 인증 모듈 초기화
init() ->
    % Redis 연결 설정
    RedisHost = get_redis_host(),
    RedisPort = get_redis_port(),
    
    case eredis:start_link(RedisHost, RedisPort) of
        {ok, Pid} ->
            register(redis_client, Pid),
            io:format("Redis client started successfully (Host: ~s, Port: ~p)~n", 
                     [RedisHost, RedisPort]),
            {ok, Pid};
        {error, Reason} ->
            io:format("Failed to start Redis client: ~p~n", [Reason]),
            {error, Reason}
    end.

%% 쿠키에서 JWT 토큰 추출
extract_token_from_cookie(Req) ->
    io:format("[DEBUG] Extracting token from cookies~n"),
    case cowboy_req:parse_cookies(Req) of
        CookieList when is_list(CookieList) ->
            io:format("[DEBUG] Cookie list: ~p~n", [CookieList]),
            case find_token_in_cookies(CookieList) of
                {ok, Token} ->
                    io:format("[DEBUG] Token found successfully~n"),
                    {ok, Token};
                {error, no_token} ->
                    io:format("[DEBUG] No auth token found in cookies~n"),
                    {error, no_token}
            end;
        CookieMap when is_map(CookieMap) ->
            io:format("[DEBUG] Cookie map: ~p~n", [CookieMap]),
            case maps:get(<<"auth_token">>, CookieMap, undefined) of
                undefined ->
                    case maps:get(<<"jwt_token">>, CookieMap, undefined) of
                        undefined ->
                            io:format("[DEBUG] No auth token found in cookies. Available cookies: ~p~n", [maps:keys(CookieMap)]),
                            {error, no_token};
                        Token ->
                            io:format("[DEBUG] Found jwt_token cookie~n"),
                            {ok, Token}
                    end;
                Token ->
                    io:format("[DEBUG] Found auth_token cookie~n"),
                    {ok, Token}
            end;
        Other ->
            io:format("[DEBUG] Unexpected cookie format: ~p~n", [Other]),
            {error, no_token}
    end.

%% 쿠키 리스트에서 토큰 찾기
find_token_in_cookies([]) ->
    {error, no_token};
find_token_in_cookies([{<<"auth_token">>, Token} | _]) ->
    {ok, Token};
find_token_in_cookies([{<<"jwt_token">>, Token} | _]) ->
    {ok, Token};
find_token_in_cookies([_ | Rest]) ->
    find_token_in_cookies(Rest).

%% JWT 토큰 검증 (형식 및 서명 확인)
validate_token(Token) ->
    io:format("[DEBUG] Validating JWT token~n"),
    try
        JwtSecret = get_jwt_secret(),
        io:format("[DEBUG] JWT secret loaded~n"),
        case jwt:decode(Token, JwtSecret) of
            {ok, Claims} ->
                io:format("[DEBUG] JWT token decoded successfully. Claims: ~p~n", [Claims]),
                % 토큰 만료 시간 확인
                case check_token_expiry(Claims) of
                    ok ->
                        UserId = maps:get(<<"user_id">>, Claims, undefined),
                        io:format("[DEBUG] Token validation successful for user: ~p~n", [UserId]),
                        {ok, UserId, Claims};
                    {error, expired} ->
                        io:format("[DEBUG] Token expired~n"),
                        {error, token_expired}
                end;
            {error, Reason} ->
                io:format("[DEBUG] JWT decode failed: ~p~n", [Reason]),
                {error, invalid_token}
        end
    catch
        _:Error ->
            io:format("[ERROR] JWT validation error: ~p~n", [Error]),
            {error, invalid_token}
    end.

%% 토큰 만료 시간 확인
check_token_expiry(Claims) ->
    io:format("[DEBUG] Checking token expiry~n"),
    case maps:get(<<"exp">>, Claims, undefined) of
        undefined ->
            io:format("[DEBUG] No expiry time found in token~n"),
            {error, no_expiry};
        ExpTime ->
            CurrentTime = erlang:system_time(second),
            io:format("[DEBUG] Current time: ~p, Token expiry: ~p~n", [CurrentTime, ExpTime]),
            if
                ExpTime > CurrentTime ->
                    io:format("[DEBUG] Token not expired~n"),
                    ok;
                true ->
                    io:format("[DEBUG] Token expired~n"),
                    {error, expired}
            end
    end.

%% Redis에서 토큰 존재 여부 확인
verify_token_in_redis(Token) ->
    io:format("[DEBUG] Verifying token in Redis~n"),
    try
        RedisKey = "token:" ++ binary_to_list(Token),
        io:format("[DEBUG] Redis key: ~s~n", [RedisKey]),
        case eredis:q(redis_client, ["HGETALL", RedisKey]) of
            {ok, []} ->
                io:format("[DEBUG] Token not found in Redis~n"),
                {error, token_not_found};
            {ok, HashData} ->
                io:format("[DEBUG] Token found in Redis. Data: ~p~n", [HashData]),
                case parse_redis_hash(HashData) of
                    #{<<"user_id">> := UserId, <<"is_active">> := <<"true">>} = SessionData ->
                        io:format("[DEBUG] Token is active for user: ~p~n", [UserId]),
                        % 토큰 만료 시간 확인
                        case check_redis_token_expiry(SessionData) of
                            ok ->
                                io:format("[DEBUG] Redis token verification successful~n"),
                                {ok, UserId, SessionData};
                            {error, expired} ->
                                io:format("[DEBUG] Redis token expired~n"),
                                {error, token_expired}
                        end;
                    #{<<"is_active">> := _} ->
                        io:format("[DEBUG] Token is inactive/revoked~n"),
                        {error, token_revoked};
                    _ ->
                        io:format("[DEBUG] Invalid Redis token data~n"),
                        {error, invalid_token_data}
                end;
            {error, Reason} ->
                io:format("[ERROR] Redis query failed: ~p~n", [Reason]),
                {error, redis_error}
        end
    catch
        _:Error ->
            io:format("[ERROR] Redis token verification error: ~p~n", [Error]),
            {error, redis_error}
    end.

%% 사용자 세션 정보 조회 (토큰 기반)
get_user_session(Token) ->
    try
        RedisKey = "token:" ++ binary_to_list(Token),
        case eredis:q(redis_client, ["HGETALL", RedisKey]) of
            {ok, []} ->
                {error, session_not_found};
            {ok, HashData} ->
                case parse_redis_hash(HashData) of
                    SessionMap when is_map(SessionMap) ->
                        {ok, SessionMap};
                    _ ->
                        {error, invalid_session_format}
                end;
            {error, Reason} ->
                {error, {redis_error, Reason}}
        end
    catch
        _:Error ->
            {error, {redis_exception, Error}}
    end.

%% Redis 해시 데이터 파싱
parse_redis_hash([]) ->
    #{};
parse_redis_hash([Key, Value | Rest]) ->
    Map = parse_redis_hash(Rest),
    Map#{Key => Value}.

%% Redis 토큰 만료 시간 확인
check_redis_token_expiry(SessionData) ->
    case maps:get(<<"expires_at">>, SessionData, undefined) of
        undefined ->
            {error, no_expiry};
        ExpiresAtBinary ->
            try
                ExpiresAt = binary_to_integer(ExpiresAtBinary),
                CurrentTime = erlang:system_time(second),
                if
                    ExpiresAt > CurrentTime ->
                        ok;
                    true ->
                        {error, expired}
                end
            catch
                _:_ ->
                    {error, invalid_expiry_format}
            end
    end.

%% Auth Server에서 토큰 갱신 요청
refresh_tokens(CookieHeader) when is_binary(CookieHeader) ->
    refresh_tokens(binary_to_list(CookieHeader));
refresh_tokens(CookieHeader) when is_list(CookieHeader) ->
    try
        % httpc 애플리케이션 시작 확인
        inets:start(),
        ssl:start(),
        
        AuthServerUrl = "http://contestapp-auth-server:60000/auth/refresh",
        
        Headers = [
            {"Cookie", CookieHeader},
            {"Content-Type", "application/json"}
        ],
        
        io:format("[INFO] Attempting token refresh with cookies: ~s~n", [CookieHeader]),
        
        case httpc:request(post, {AuthServerUrl, Headers, "application/json", ""}, [], []) of
            {ok, {{_Version, 200, _ReasonPhrase}, ResponseHeaders, ResponseBody}} ->
                io:format("[INFO] Token refresh successful~n"),
                
                % Set-Cookie 헤더들 추출
                SetCookies = extract_set_cookies(ResponseHeaders),
                
                case jsx:decode(list_to_binary(ResponseBody), [return_maps]) of
                    #{<<"user">> := UserInfo} ->
                        {ok, #{user => UserInfo, cookies => SetCookies}};
                    _ ->
                        {ok, #{cookies => SetCookies}}
                end;
                
            {ok, {{_Version, StatusCode, _ReasonPhrase}, _ResponseHeaders, ResponseBody}} ->
                io:format("[ERROR] Token refresh failed with status ~p: ~s~n", [StatusCode, ResponseBody]),
                {error, {refresh_failed, StatusCode}};
                
            {error, Reason} ->
                io:format("[ERROR] Token refresh request failed: ~p~n", [Reason]),
                {error, {request_failed, Reason}}
        end
    catch
        _:Error ->
            io:format("[ERROR] Token refresh exception: ~p~n", [Error]),
            {error, {refresh_exception, Error}}
    end;
refresh_tokens(_) ->
    {error, invalid_cookie_format}.

%% Set-Cookie 헤더들 추출
extract_set_cookies(Headers) ->
    lists:foldl(fun({HeaderName, HeaderValue}, Acc) ->
        case string:to_lower(HeaderName) of
            "set-cookie" ->
                [HeaderValue | Acc];
            _ ->
                Acc
        end
    end, [], Headers).

%% 리소스 정리
cleanup() ->
    case whereis(redis_client) of
        undefined ->
            ok;
        Pid ->
            eredis:stop(Pid),
            unregister(redis_client),
            ok
    end. 