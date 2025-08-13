%%%-------------------------------------------------------------------
%% @doc 토큰 검증 HTTP 핸들러 - Redis 기반 토큰 검증
%% @end
%%%-------------------------------------------------------------------

-module(token_verify_handler).

-export([init/2]).

%% HTTP 핸들러
init(Req0, State) ->
    Method = cowboy_req:method(Req0),
    Path = cowboy_req:path(Req0),
    Headers = cowboy_req:headers(Req0),
    
    % 요청 정보 로깅
    io:format("~n=== TOKEN VERIFY REQUEST ===~n"),
    io:format("Method: ~p~n", [Method]),
    io:format("Path: ~p~n", [Path]),
    io:format("Headers: ~p~n", [Headers]),
    io:format("============================~n"),
    
    handle_request(Method, Req0, State).

%% GET 요청 처리 - 토큰 검증
handle_request(<<"GET">>, Req0, State) ->
    io:format("[DEBUG] Processing GET request for token verification~n"),
    try
        % 쿠키에서 JWT 토큰 추출
        case auth_module:extract_token_from_cookie(Req0) of
            {ok, Token} ->
                io:format("[DEBUG] Token extracted successfully~n"),
                % JWT 토큰 검증
                case auth_module:validate_token(Token) of
                    {ok, UserId, _Claims} ->
                        io:format("[DEBUG] JWT validation successful for user: ~p~n", [UserId]),
                        % Redis에서 토큰 존재 여부 확인
                        case auth_module:verify_token_in_redis(Token) of
                            {ok, UserId, SessionData} ->
                                % 검증 성공
                                io:format("[DEBUG] Redis verification successful~n"),
                                logger_util:info(UserId, undefined, "Token verification successful"),
                                
                                ResponseBody = jsx:encode(#{
                                    <<"valid">> => true,
                                    <<"user">> => #{
                                        <<"id">> => UserId,
                                        <<"username">> => maps:get(<<"username">>, SessionData, <<>>),
                                        <<"email">> => maps:get(<<"email">>, SessionData, <<>>)
                                    },
                                    <<"message">> => <<"Token is valid">>
                                }),
                                
                                io:format("[DEBUG] Sending success response~n"),
                                Req = cowboy_req:reply(200, #{
                                    <<"content-type">> => <<"application/json">>,
                                    <<"access-control-allow-origin">> => <<"http://localhost:3000">>,
                                    <<"access-control-allow-credentials">> => <<"true">>,
                                    <<"access-control-allow-methods">> => <<"GET, POST, OPTIONS">>,
                                    <<"access-control-allow-headers">> => <<"Content-Type, Authorization">>
                                }, ResponseBody, Req0),
                                
                                {ok, Req, State};
                            {error, token_expired} ->
                                io:format("[DEBUG] Token expired~n"),
                                logger_util:warn(UserId, undefined, "Token expired"),
                                send_error_response(Req0, State, 401, "token_expired", "Token has expired");
                            {error, token_revoked} ->
                                io:format("[DEBUG] Token revoked~n"),
                                logger_util:warn(UserId, undefined, "Token revoked"),
                                send_error_response(Req0, State, 401, "token_revoked", "Token has been revoked");
                            {error, Reason} ->
                                io:format("[DEBUG] Redis token validation failed: ~p~n", [Reason]),
                                logger_util:error(UserId, undefined, "Redis token validation failed: ~p", [Reason]),
                                send_error_response(Req0, State, 401, "token_not_found", "Token not found or invalid")
                        end;
                    {error, token_expired} ->
                        io:format("[DEBUG] JWT token expired~n"),
                        logger_util:warn(undefined, undefined, "JWT token expired"),
                        send_error_response(Req0, State, 401, "jwt_expired", "JWT token has expired");
                    {error, Reason} ->
                        io:format("[DEBUG] JWT validation failed: ~p~n", [Reason]),
                        logger_util:error(undefined, undefined, "JWT validation failed: ~p", [Reason]),
                        send_error_response(Req0, State, 401, "invalid_jwt", "Invalid JWT token")
                end;
            {error, no_token} ->
                io:format("[DEBUG] No token provided~n"),
                logger_util:warn(undefined, undefined, "No token provided"),
                send_error_response(Req0, State, 401, "no_token", "No authentication token provided")
        end
    catch
        _:Error ->
            io:format("[ERROR] Token verification error: ~p~n", [Error]),
            logger_util:error(undefined, undefined, "Token verification error: ~p", [Error]),
            send_error_response(Req0, State, 500, "internal_error", "Internal server error")
    end;

%% OPTIONS 요청 처리 - CORS preflight
handle_request(<<"OPTIONS">>, Req0, State) ->
    io:format("[DEBUG] Processing OPTIONS request (CORS preflight)~n"),
    Req = cowboy_req:reply(200, #{
        <<"access-control-allow-origin">> => <<"http://localhost:3000">>,
        <<"access-control-allow-methods">> => <<"GET, POST, OPTIONS">>,
        <<"access-control-allow-headers">> => <<"Content-Type, Authorization">>,
        <<"access-control-allow-credentials">> => <<"true">>,
        <<"access-control-max-age">> => <<"86400">>
    }, <<>>, Req0),
    {ok, Req, State};

%% 지원하지 않는 메서드
handle_request(Method, Req0, State) ->
    io:format("[DEBUG] Unsupported method: ~p~n", [Method]),
    send_error_response(Req0, State, 405, "method_not_allowed", "Method not allowed").

%% 에러 응답 전송
send_error_response(Req0, State, StatusCode, ErrorCode, Message) ->
    io:format("[DEBUG] Sending error response: ~p - ~s~n", [StatusCode, Message]),
    ResponseBody = jsx:encode(#{
        <<"valid">> => false,
        <<"error">> => list_to_binary(ErrorCode),
        <<"message">> => list_to_binary(Message)
    }),
    
    Req = cowboy_req:reply(StatusCode, #{
        <<"content-type">> => <<"application/json">>,
        <<"access-control-allow-origin">> => <<"http://localhost:3000">>,
        <<"access-control-allow-credentials">> => <<"true">>,
        <<"access-control-allow-methods">> => <<"GET, POST, OPTIONS">>,
        <<"access-control-allow-headers">> => <<"Content-Type, Authorization">>
    }, ResponseBody, Req0),
    
    {ok, Req, State}. 