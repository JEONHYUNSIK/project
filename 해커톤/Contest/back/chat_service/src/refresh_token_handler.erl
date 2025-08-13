%%%-------------------------------------------------------------------
%% @doc 토큰 갱신 핸들러 - Auth Server의 refresh 엔드포인트 프록시
%% @end
%%%-------------------------------------------------------------------

-module(refresh_token_handler).

-export([init/2]).

init(Req0, State) ->
    Method = cowboy_req:method(Req0),
    handle_request(Method, Req0, State).

%% POST 요청 처리 (토큰 갱신)
handle_request(<<"POST">>, Req0, State) ->
    io:format("[INFO] Token refresh request received~n"),
    
    % 쿠키 헤더 추출
    CookieHeader = case cowboy_req:header(<<"cookie">>, Req0) of
        undefined ->
            io:format("[ERROR] No cookie header found~n"),
            "";
        Cookie when is_binary(Cookie) ->
            binary_to_list(Cookie);
        Cookie when is_list(Cookie) ->
            Cookie
    end,
    
    case CookieHeader of
        "" ->
            % 쿠키가 없으면 400 에러
            Response = jsx:encode(#{
                <<"error">> => <<"No cookies provided">>,
                <<"message">> => <<"Refresh token is required">>
            }),
            Req1 = cowboy_req:reply(400, 
                #{
                    <<"content-type">> => <<"application/json">>,
                    <<"access-control-allow-origin">> => <<"http://localhost:3000">>,
                    <<"access-control-allow-credentials">> => <<"true">>
                }, 
                Response, Req0),
            {ok, Req1, State};
            
        _ ->
            % Auth Server에 토큰 갱신 요청
            try
                case auth_module:refresh_tokens(CookieHeader) of
                    {ok, #{cookies := SetCookies} = Result} ->
                        io:format("[INFO] Token refresh successful~n"),
                        
                        % 응답 준비
                        ResponseBody = case maps:get(user, Result, undefined) of
                            undefined ->
                                jsx:encode(#{
                                    <<"message">> => <<"Tokens refreshed successfully">>
                                });
                            UserInfo ->
                                jsx:encode(#{
                                    <<"message">> => <<"Tokens refreshed successfully">>,
                                    <<"user">> => UserInfo
                                })
                        end,
                        
                        % Set-Cookie 헤더들을 응답에 추가
                        Headers = #{
                            <<"content-type">> => <<"application/json">>,
                            <<"access-control-allow-origin">> => <<"http://localhost:3000">>,
                            <<"access-control-allow-credentials">> => <<"true">>,
                            <<"access-control-allow-methods">> => <<"POST, OPTIONS">>,
                            <<"access-control-allow-headers">> => <<"Content-Type, Cookie">>
                        },
                        Req1 = lists:foldl(fun(Cookie, ReqAcc) ->
                            parse_and_set_cookie(Cookie, ReqAcc)
                        end, Req0, SetCookies),
                        
                        Req2 = cowboy_req:reply(200, Headers, ResponseBody, Req1),
                        {ok, Req2, State};
                        
                    {error, {refresh_failed, StatusCode}} ->
                        io:format("[ERROR] Token refresh failed with status: ~p~n", [StatusCode]),
                        Response = jsx:encode(#{
                            <<"error">> => <<"Refresh failed">>,
                            <<"message">> => <<"Unable to refresh tokens">>,
                            <<"status_code">> => StatusCode
                        }),
                        Req1 = cowboy_req:reply(401, 
                            #{
                                <<"content-type">> => <<"application/json">>,
                                <<"access-control-allow-origin">> => <<"http://localhost:3000">>,
                                <<"access-control-allow-credentials">> => <<"true">>
                            }, 
                            Response, Req0),
                        {ok, Req1, State};
                        
                    {error, Reason} ->
                        io:format("[ERROR] Token refresh error: ~p~n", [Reason]),
                        Response = jsx:encode(#{
                            <<"error">> => <<"Internal error">>,
                            <<"message">> => <<"Failed to refresh tokens">>
                        }),
                        Req1 = cowboy_req:reply(500, 
                            #{
                                <<"content-type">> => <<"application/json">>,
                                <<"access-control-allow-origin">> => <<"http://localhost:3000">>,
                                <<"access-control-allow-credentials">> => <<"true">>
                            }, 
                            Response, Req0),
                        {ok, Req1, State}
                end
            catch
                _:Error ->
                    io:format("[ERROR] Token refresh handler exception: ~p~n", [Error]),
                    ErrorResponse = jsx:encode(#{
                        <<"error">> => <<"Internal error">>,
                        <<"message">> => <<"Request processing failed">>
                    }),
                    ErrorReq = cowboy_req:reply(500, 
                        #{
                            <<"content-type">> => <<"application/json">>,
                            <<"access-control-allow-origin">> => <<"http://localhost:3000">>,
                            <<"access-control-allow-credentials">> => <<"true">>
                        }, 
                        ErrorResponse, Req0),
                    {ok, ErrorReq, State}
            end
    end;

%% 다른 HTTP 메서드는 405 Method Not Allowed
handle_request(_Method, Req0, State) ->
    Response = jsx:encode(#{
        <<"error">> => <<"Method not allowed">>,
        <<"message">> => <<"Only POST method is supported">>
    }),
    Req1 = cowboy_req:reply(405, 
        #{
            <<"content-type">> => <<"application/json">>,
            <<"access-control-allow-origin">> => <<"http://localhost:3000">>,
            <<"access-control-allow-credentials">> => <<"true">>
        }, 
        Response, Req0),
    {ok, Req1, State}.

%% Set-Cookie 헤더 파싱 및 설정
parse_and_set_cookie(CookieString, Req) ->
    try
        % "name=value; Path=/; HttpOnly" 형태의 쿠키 문자열 파싱
        Parts = string:split(CookieString, ";", all),
        [NameValue | Attributes] = [string:trim(Part) || Part <- Parts],
        
        % 이름과 값 분리
        case string:split(NameValue, "=", leading) of
            [Name, Value] ->
                CookieName = list_to_binary(string:trim(Name)),
                CookieValue = list_to_binary(string:trim(Value)),
                
                % 쿠키 옵션 파싱
                Opts = parse_cookie_attributes(Attributes),
                
                io:format("[DEBUG] Setting cookie: ~s=~s with opts: ~p~n", 
                         [CookieName, CookieValue, Opts]),
                
                cowboy_req:set_resp_cookie(CookieName, CookieValue, Req, Opts);
                
            _ ->
                io:format("[ERROR] Invalid cookie format: ~s~n", [CookieString]),
                Req
        end
    catch
        _:Error ->
            io:format("[ERROR] Cookie parsing error: ~p~n", [Error]),
            Req
    end.

%% 쿠키 속성 파싱
parse_cookie_attributes(Attributes) ->
    lists:foldl(fun(Attr, Opts) ->
        AttrLower = string:to_lower(string:trim(Attr)),
        case AttrLower of
            "httponly" ->
                Opts#{http_only => true};
            "secure" ->
                Opts#{secure => true};
            "path=" ++ Path ->
                Opts#{path => list_to_binary(string:trim(Path))};
            "max-age=" ++ MaxAge ->
                try
                    Opts#{max_age => list_to_integer(string:trim(MaxAge))}
                catch
                    _:_ -> Opts
                end;
            _ ->
                Opts
        end
    end, #{}, Attributes).