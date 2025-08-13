%%%-------------------------------------------------------------------
%% @doc chat_service public API
%% @end
%%%-------------------------------------------------------------------

-module(chat_service_app).

-behaviour(application).

-export([start/2, stop/1]).

start(_StartType, _StartArgs) ->
    % 환경 변수 또는 application env에서 포트 가져오기
    Port = case os:getenv("PORT") of
        false -> application:get_env(chat_service, port, 8085);
        PortStr -> list_to_integer(PortStr)
    end,
    
    io:format("~n=== CHAT SERVICE STARTING ===~n"),
    io:format("Port: ~p~n", [Port]),
    
    % 인증 모듈 초기화
    case auth_module:init() of
        {ok, _} ->
            io:format("Authentication module initialized successfully~n");
        {error, AuthReason} ->
            io:format("Failed to initialize authentication module: ~p~n", [AuthReason]),
            exit({auth_init_failed, AuthReason})
    end,
    
    % ScyllaDB 모듈 초기화
    case scylla_module:init() of
        {ok, _} ->
            io:format("ScyllaDB module initialized successfully~n");
        {error, ScyllaReason} ->
            io:format("Failed to initialize ScyllaDB module: ~p~n", [ScyllaReason]),
            exit({scylla_init_failed, ScyllaReason})
    end,
    
    % 라우팅 설정 (WebSocket 및 토큰 검증 추가)
    Dispatch = cowboy_router:compile([
        {'_', [
            {"/", chat_handler, []},
            {"/health", health_handler, []},
            {"/verify", token_verify_handler, []},
            {"/refresh", refresh_token_handler, []},
            {"/scylla-test", scylla_test_handler, []},
            {"/chat", websocket_handler, []}
        ]}
    ]),
    
    io:format("Routes configured:~n"),
    io:format("  GET  / -> chat_handler~n"),
    io:format("  GET  /health -> health_handler~n"),
    io:format("  GET  /verify -> token_verify_handler~n"),
    io:format("  POST /refresh -> refresh_token_handler~n"),
    io:format("  GET/POST /scylla-test -> scylla_test_handler~n"),
    io:format("  WS   /chat -> websocket_handler~n"),
    
    % Cowboy HTTP 서버 시작
    {ok, _} = cowboy:start_clear(http_listener,
        [{port, Port}],
        #{env => #{dispatch => Dispatch}}
    ),
    
    % 서버 시작 로그
    io:format("Chat service started on port ~p~n", [Port]),
    io:format("WebSocket endpoint available at /chat~n"),
    io:format("Token verification endpoint available at /verify~n"),
    io:format("Token refresh endpoint available at /refresh~n"),
    io:format("Health check endpoint available at /health~n"),
    io:format("ScyllaDB test endpoint available at /scylla-test~n"),
    io:format("Service info endpoint available at /~n"),
    io:format("==============================~n"),
    
    % Supervisor 시작
    chat_service_sup:start_link().

stop(_State) ->
    % ScyllaDB 모듈 정리
    scylla_module:cleanup(),
    io:format("ScyllaDB module cleaned up~n"),
    
    % 인증 모듈 정리
    auth_module:cleanup(),
    io:format("Authentication module cleaned up~n"),
    
    % Cowboy 서버 종료
    cowboy:stop_listener(http_listener),
    io:format("Chat service stopped~n"),
    ok.

%% internal functions
