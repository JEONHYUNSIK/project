%%%-------------------------------------------------------------------
%% @doc ScyllaDB 테스트 핸들러
%% ScyllaDB 연결 테스트 및 기본 CRUD 작업을 위한 HTTP 핸들러
%% @end
%%%-------------------------------------------------------------------

-module(scylla_test_handler).

-export([init/2]).

init(Req0, State) ->
    Method = cowboy_req:method(Req0),
    Path = cowboy_req:path(Req0),
    Headers = cowboy_req:headers(Req0),
    
    % 요청 정보 로깅
    io:format("~n=== SCYLLA TEST HANDLER REQUEST ===~n"),
    io:format("Method: ~p~n", [Method]),
    io:format("Path: ~p~n", [Path]),
    io:format("Headers: ~p~n", [Headers]),
    io:format("===================================~n"),
    
    handle_request(Method, Req0, State).

%% GET 요청 처리 - ScyllaDB 연결 테스트 및 데이터 조회
handle_request(<<"GET">>, Req0, State) ->
    io:format("[DEBUG] Processing GET request for ScyllaDB test~n"),
    
    try
        % 1. 연결 테스트
        io:format("=== Step 1: Connection Test ===~n"),
        ConnectionResult = case scylla_module:test_connection() of
            {ok, connection_ok} ->
                #{<<"connection">> => <<"success">>, <<"message">> => <<"ScyllaDB connection OK">>};
            {error, ConnReason} ->
                #{<<"connection">> => <<"failed">>, <<"error">> => list_to_binary(io_lib:format("~p", [ConnReason]))}
        end,
        
        % 2. 테스트 메시지 조회
        io:format("=== Step 2: Get Test Messages ===~n"),
        MessagesResult = case scylla_module:get_test_messages() of
            {ok, Messages} ->
                % 메시지 리스트를 JSON 형태로 변환
                FormattedMessages = lists:map(fun(Row) ->
                    #{
                        <<"id">> => proplists:get_value(id, Row, <<>>),
                        <<"user_id">> => proplists:get_value(user_id, Row, <<>>),
                        <<"content">> => proplists:get_value(content, Row, <<>>),
                        <<"created_at">> => proplists:get_value(created_at, Row, 0)
                    }
                end, Messages),
                #{<<"messages">> => FormattedMessages, <<"count">> => length(Messages)};
            {error, MsgReason} ->
                #{<<"messages">> => [], <<"error">> => list_to_binary(io_lib:format("~p", [MsgReason]))}
        end,
        
        % 응답 생성
        ResponseBody = jsx:encode(#{
            <<"status">> => <<"ok">>,
            <<"test_type">> => <<"scylladb_test">>,
            <<"timestamp">> => erlang:system_time(second),
            <<"results">> => #{
                <<"connection_test">> => ConnectionResult,
                <<"messages_query">> => MessagesResult
            }
        }),
        
        io:format("[DEBUG] Sending ScyllaDB test response~n"),
        Req = cowboy_req:reply(200, #{
            <<"content-type">> => <<"application/json">>,
            <<"access-control-allow-origin">> => <<"http://localhost:3000">>,
            <<"access-control-allow-credentials">> => <<"true">>,
            <<"access-control-allow-methods">> => <<"GET, POST, OPTIONS">>,
            <<"access-control-allow-headers">> => <<"Content-Type, Authorization">>
        }, ResponseBody, Req0),
        
        {ok, Req, State}
        
    catch
        Class:Error:Stacktrace ->
            io:format("[ERROR] ScyllaDB test handler error: ~p:~p~n", [Class, Error]),
            io:format("Stacktrace: ~p~n", [Stacktrace]),
            
            ErrorBody = jsx:encode(#{
                <<"status">> => <<"error">>,
                <<"error">> => <<"test_handler_exception">>,
                <<"message">> => list_to_binary(io_lib:format("~p:~p", [Class, Error]))
            }),
            
            ErrorReq = cowboy_req:reply(500, #{
                <<"content-type">> => <<"application/json">>,
                <<"access-control-allow-origin">> => <<"http://localhost:3000">>,
                <<"access-control-allow-credentials">> => <<"true">>,
                <<"access-control-allow-methods">> => <<"GET, POST, OPTIONS">>,
                <<"access-control-allow-headers">> => <<"Content-Type, Authorization">>
            }, ErrorBody, Req0),
            
            {ok, ErrorReq, State}
    end;

%% POST 요청 처리 - 테스트 메시지 삽입
handle_request(<<"POST">>, Req0, State) ->
    io:format("[DEBUG] Processing POST request for ScyllaDB test message insert~n"),
    
    try
        % 요청 본문 읽기
        {ok, Body, Req1} = cowboy_req:read_body(Req0),
        io:format("[DEBUG] Request body: ~s~n", [Body]),
        
        % JSON 파싱
        case jsx:decode(Body, [return_maps]) of
            #{<<"user_id">> := UserId, <<"content">> := Content} = RequestData ->
                % 생성 시간 설정 (현재 시간 또는 요청에서 제공된 시간)
                CreatedAt = case maps:get(<<"created_at">>, RequestData, undefined) of
                    undefined -> erlang:system_time(millisecond);
                    ProvidedTime -> ProvidedTime
                end,
                
                io:format("=== Inserting Test Message ===~n"),
                io:format("User ID: ~s~n", [UserId]),
                io:format("Content: ~s~n", [Content]),
                io:format("Created At: ~p~n", [CreatedAt]),
                
                % 메시지 삽입
                case scylla_module:insert_test_message(UserId, Content, CreatedAt) of
                    {ok, inserted} ->
                        ResponseBody = jsx:encode(#{
                            <<"status">> => <<"success">>,
                            <<"message">> => <<"Test message inserted successfully">>,
                            <<"data">> => #{
                                <<"user_id">> => UserId,
                                <<"content">> => Content,
                                <<"created_at">> => CreatedAt
                            }
                        }),
                        
                        io:format("[DEBUG] Message inserted successfully~n"),
                        SuccessReq = cowboy_req:reply(201, #{
                            <<"content-type">> => <<"application/json">>,
                            <<"access-control-allow-origin">> => <<"http://localhost:3000">>,
                            <<"access-control-allow-credentials">> => <<"true">>,
                            <<"access-control-allow-methods">> => <<"GET, POST, OPTIONS">>,
                            <<"access-control-allow-headers">> => <<"Content-Type, Authorization">>
                        }, ResponseBody, Req1),
                        
                        {ok, SuccessReq, State};
                    
                    {error, InsertReason} ->
                        io:format("[ERROR] Failed to insert message: ~p~n", [InsertReason]),
                        send_error_response(Req1, State, 500, "insert_failed", 
                                          io_lib:format("Failed to insert message: ~p", [InsertReason]))
                end;
            
            _ ->
                io:format("[ERROR] Invalid request format~n"),
                send_error_response(Req1, State, 400, "invalid_request", 
                                  "Request must contain user_id and content fields")
        end
    catch
        Class:Error:Stacktrace ->
            io:format("[ERROR] POST handler error: ~p:~p~n", [Class, Error]),
            io:format("Stacktrace: ~p~n", [Stacktrace]),
            send_error_response(Req0, State, 500, "handler_exception", 
                              io_lib:format("~p:~p", [Class, Error]))
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
        <<"status">> => <<"error">>,
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