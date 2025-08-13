%%%-------------------------------------------------------------------
%% @doc 헬스체크 핸들러
%% @end
%%%-------------------------------------------------------------------

-module(health_handler).

-export([init/2]).

init(Req0, State) ->
    Method = cowboy_req:method(Req0),
    Path = cowboy_req:path(Req0),
    Headers = cowboy_req:headers(Req0),
    
    % 요청 정보 로깅
    io:format("~n=== HEALTH HANDLER REQUEST ===~n"),
    io:format("Method: ~p~n", [Method]),
    io:format("Path: ~p~n", [Path]),
    io:format("Headers: ~p~n", [Headers]),
    io:format("===============================~n"),
    
    handle_request(Method, Req0, State).

%% GET 요청 처리
handle_request(<<"GET">>, Req0, State) ->
    io:format("[DEBUG] Processing GET request for health check~n"),
    
    Body = jsx:encode(#{
        <<"status">> => <<"healthy">>,
        <<"service">> => <<"chat_service">>,
        <<"timestamp">> => erlang:system_time(second),
        <<"uptime">> => get_uptime()
    }),
    
    io:format("[DEBUG] Sending health check response~n"),
    Req = cowboy_req:reply(200, #{
        <<"content-type">> => <<"application/json">>,
        <<"access-control-allow-origin">> => <<"http://localhost:3000">>,
        <<"access-control-allow-credentials">> => <<"true">>,
        <<"access-control-allow-methods">> => <<"GET, POST, OPTIONS">>,
        <<"access-control-allow-headers">> => <<"Content-Type, Authorization">>
    }, Body, Req0),
    
    {ok, Req, State};

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
    ErrorBody = jsx:encode(#{
        <<"error">> => <<"method_not_allowed">>,
        <<"message">> => <<"Method not allowed">>
    }),
    
    Req = cowboy_req:reply(405, #{
        <<"content-type">> => <<"application/json">>,
        <<"access-control-allow-origin">> => <<"http://localhost:3000">>,
        <<"access-control-allow-credentials">> => <<"true">>,
        <<"access-control-allow-methods">> => <<"GET, POST, OPTIONS">>,
        <<"access-control-allow-headers">> => <<"Content-Type, Authorization">>
    }, ErrorBody, Req0),
    
    {ok, Req, State}.

%% 서버 업타임 계산
get_uptime() ->
    {UpTime, _} = erlang:statistics(wall_clock),
    UpTime div 1000.  % 초 단위로 변환 