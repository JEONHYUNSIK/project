%%%-------------------------------------------------------------------
%% @doc ScyllaDB 연결 및 관리 모듈
%% ScyllaDB와의 연결을 관리하고 채팅 관련 데이터를 저장/조회하는 기능 제공
%% @end
%%%-------------------------------------------------------------------

-module(scylla_module).

-include_lib("cqerl/include/cqerl.hrl").

-export([
    init/0,
    cleanup/0,
    get_client/0,
    create_keyspace_and_tables/0,
    test_connection/0,
    insert_test_message/3,
    get_test_messages/0
]).

%% 환경 변수에서 설정 가져오기
get_scylla_host() ->
    case os:getenv("SCYLLA_HOST") of
        false -> "contestapp-scylladb";  % 기본값
        Host -> Host
    end.

get_scylla_port() ->
    case os:getenv("SCYLLA_PORT") of
        false -> 9042;  % 기본값
        PortStr -> list_to_integer(PortStr)
    end.

%% ScyllaDB 연결 초기화
init() ->
    ScyllaHost = get_scylla_host(),
    ScyllaPort = get_scylla_port(),
    
    io:format("~n=== SCYLLADB MODULE INITIALIZATION ===~n"),
    io:format("Connecting to ScyllaDB at ~s:~p~n", [ScyllaHost, ScyllaPort]),
    
    % ETS 테이블 생성 (전역 클라이언트 저장소)
    case ets:info(scylla_clients) of
        undefined ->
            ets:new(scylla_clients, [named_table, public, set]),
            io:format("Created ETS table for ScyllaDB clients~n");
        _ ->
            io:format("ETS table for ScyllaDB clients already exists~n")
    end,
    
    % cqerl 애플리케이션 시작 확인 및 시작
    case application:which_applications() of
        Apps when is_list(Apps) ->
            case lists:keyfind(cqerl, 1, Apps) of
                false ->
                    io:format("Warning: cqerl application not started, attempting to start...~n"),
                    case application:start(cqerl) of
                        ok ->
                            io:format("Successfully started cqerl application~n");
                        {error, {already_started, cqerl}} ->
                            io:format("cqerl application already started~n");
                        {error, CqerlStartReason} ->
                            io:format("Failed to start cqerl application: ~p~n", [CqerlStartReason])
                    end;
                {cqerl, _, _} ->
                    io:format("cqerl application is running~n")
            end
    end,
    
    % 연결 재시도 로직
    connect_with_retry(ScyllaHost, ScyllaPort, 3, 3000).

%% 재시도 로직이 포함된 연결 함수
connect_with_retry(_Host, _Port, 0, _Delay) ->
    io:format("All connection attempts failed~n"),
    {error, max_retries_exceeded};
connect_with_retry(Host, Port, Retries, Delay) ->
    io:format("Connection attempt ~p/3 to ~s:~p~n", [4 - Retries, Host, Port]),
    try
        % cqerl을 사용하여 ScyllaDB에 연결
        case cqerl:get_client({Host, Port}) of
            {ok, Client} ->
                % cqerl:get_client 반환값을 ETS 테이블에 저장하여 관리
                io:format("[DEBUG] Client received: ~p~n", [Client]),
                
                % ETS 테이블에 클라이언트 저장 (전역 접근 가능)
                ets:insert(scylla_clients, {default_client, Client}),
                io:format("ScyllaDB client connected successfully and stored in ETS~n"),
                logger_util:info(undefined, undefined, "ScyllaDB connection established"),
                
                % 키스페이스와 테이블 생성
                case create_keyspace_and_tables() of
                    ok ->
                        io:format("Database schema initialized successfully~n"),
                        logger_util:info(undefined, undefined, "ScyllaDB schema initialized"),
                        {ok, Client};
                    {error, Reason} ->
                        io:format("Failed to initialize database schema: ~p~n", [Reason]),
                        logger_util:error(undefined, undefined, "Failed to initialize ScyllaDB schema: ~p", [Reason]),
                        {error, {schema_init_failed, Reason}}
                end;
            {error, Reason} ->
                io:format("Connection attempt failed: ~p~n", [Reason]),
                io:format("Waiting ~p ms before retry...~n", [Delay]),
                timer:sleep(Delay),
                connect_with_retry(Host, Port, Retries - 1, Delay)
        end
    catch
        Class:Error:Stacktrace ->
            io:format("Connection attempt error: ~p:~p~n", [Class, Error]),
            io:format("Stacktrace: ~p~n", [Stacktrace]),
            io:format("Waiting ~p ms before retry...~n", [Delay]),
            timer:sleep(Delay),
            connect_with_retry(Host, Port, Retries - 1, Delay)
    end.

%% 등록된 ScyllaDB 클라이언트 가져오기
get_client() ->
    try
        case ets:lookup(scylla_clients, default_client) of
            [{default_client, Client}] ->
                {ok, Client};
            [] ->
                {error, not_initialized}
        end
    catch
        error:badarg ->
            {error, not_initialized}
    end.

%% 키스페이스 및 테이블 생성
create_keyspace_and_tables() ->
    case get_client() of
        {ok, Client} ->
            try
                % 키스페이스 생성
                KeyspaceQuery = "CREATE KEYSPACE IF NOT EXISTS contestapp "
                               "WITH REPLICATION = {"
                               "'class': 'SimpleStrategy', "
                               "'replication_factor': 1"
                               "};",
                
                io:format("[DEBUG] Creating keyspace: ~s~n", [KeyspaceQuery]),
                case cqerl:run_query(Client, KeyspaceQuery) of
                    {ok, _} ->
                        io:format("Keyspace 'contestapp' created or already exists~n"),
                        
                        % 키스페이스 사용
                        UseKeyspaceQuery = "USE contestapp;",
                        case cqerl:run_query(Client, UseKeyspaceQuery) of
                            {ok, _} ->
                                io:format("Using keyspace 'contestapp'~n"),
                                
                                % 테스트 메시지 테이블 생성
                                TestMessageTable = "CREATE TABLE IF NOT EXISTS test_messages ("
                                                  "id UUID PRIMARY KEY, "
                                                  "user_id TEXT, "
                                                  "content TEXT, "
                                                  "created_at TIMESTAMP"
                                                  ");",
                                
                                io:format("[DEBUG] Creating test table: ~s~n", [TestMessageTable]),
                                case cqerl:run_query(Client, TestMessageTable) of
                                    {ok, _} ->
                                        io:format("Test messages table created successfully~n"),
                                        ok;
                                    {error, TestTableReason} ->
                                        io:format("Failed to create test messages table: ~p~n", [TestTableReason]),
                                        {error, {test_table_creation_failed, TestTableReason}}
                                end;
                            {error, UseReason} ->
                                io:format("Failed to use keyspace: ~p~n", [UseReason]),
                                {error, {use_keyspace_failed, UseReason}}
                        end;
                    {error, KeyspaceReason} ->
                        io:format("Failed to create keyspace: ~p~n", [KeyspaceReason]),
                        {error, {keyspace_creation_failed, KeyspaceReason}}
                end
            catch
                Class:Error:Stacktrace ->
                    io:format("Schema creation error: ~p:~p~n", [Class, Error]),
                    io:format("Stacktrace: ~p~n", [Stacktrace]),
                    {error, {schema_exception, Error}}
            end;
        {error, Reason} ->
            {error, {client_not_available, Reason}}
    end.

%% 연결 테스트
test_connection() ->
    io:format("~n=== SCYLLADB CONNECTION TEST ===~n"),
    case get_client() of
        {ok, Client} ->
            try
                % 간단한 쿼리로 연결 테스트
                TestQuery = "SELECT release_version FROM system.local;",
                io:format("[DEBUG] Running test query: ~s~n", [TestQuery]),
                
                case cqerl:run_query(Client, TestQuery) of
                    {ok, Result} ->
                        io:format("Connection test successful!~n"),
                        
                        % 결과 출력
                        case cqerl:size(Result) of
                            0 ->
                                io:format("No rows returned~n");
                            _ ->
                                Row = cqerl:head(Result),
                                Version = proplists:get_value(release_version, Row, <<"unknown">>),
                                io:format("ScyllaDB version: ~s~n", [Version])
                        end,
                        
                        logger_util:info(undefined, undefined, "ScyllaDB connection test successful"),
                        {ok, connection_ok};
                    {error, Reason} ->
                        io:format("Connection test failed: ~p~n", [Reason]),
                        logger_util:error(undefined, undefined, "ScyllaDB connection test failed: ~p", [Reason]),
                        {error, {test_query_failed, Reason}}
                end
            catch
                Class:Error:Stacktrace ->
                    io:format("Connection test error: ~p:~p~n", [Class, Error]),
                    io:format("Stacktrace: ~p~n", [Stacktrace]),
                    logger_util:error(undefined, undefined, "ScyllaDB connection test exception: ~p:~p", [Class, Error]),
                    {error, {test_exception, Error}}
            end;
        {error, Reason} ->
            io:format("Cannot get ScyllaDB client: ~p~n", [Reason]),
            {error, {client_unavailable, Reason}}
    end.

%% 테스트 메시지 삽입
insert_test_message(UserId, Content, CreatedAt) ->
    io:format("~n=== INSERT TEST MESSAGE ===~n"),
    case get_client() of
        {ok, Client} ->
            try
                % UTF-8 안전 변환 (기존 websocket_handler.erl 방식 참고)
                SafeUserId = ensure_utf8_binary(UserId),
                SafeContent = ensure_utf8_binary(Content),
                
                io:format("[DEBUG] Inserting test message:~n"),
                io:format("  User ID: ~s~n", [SafeUserId]),
                io:format("  Content: ~s~n", [SafeContent]),
                io:format("  Created At: ~p~n", [CreatedAt]),
                
                % UUID 생성을 위해 new 사용 (cqerl 기능)
                InsertQuery = #cql_query{
                    statement = "INSERT INTO contestapp.test_messages (id, user_id, content, created_at) VALUES (?, ?, ?, ?);",
                    values = [
                        {id, new},  % cqerl이 자동으로 UUID 생성
                        {user_id, SafeUserId},
                        {content, SafeContent},
                        {created_at, CreatedAt}
                    ]
                },
                
                case cqerl:run_query(Client, InsertQuery) of
                    {ok, void} ->
                        io:format("Test message inserted successfully~n"),
                        logger_util:info(SafeUserId, undefined, "Test message inserted to ScyllaDB"),
                        {ok, inserted};
                    {error, Reason} ->
                        io:format("Failed to insert test message: ~p~n", [Reason]),
                        logger_util:error(SafeUserId, undefined, "Failed to insert test message: ~p", [Reason]),
                        {error, {insert_failed, Reason}}
                end
            catch
                Class:Error:Stacktrace ->
                    io:format("Insert test message error: ~p:~p~n", [Class, Error]),
                    io:format("Stacktrace: ~p~n", [Stacktrace]),
                    logger_util:error(UserId, undefined, "Insert test message exception: ~p:~p", [Class, Error]),
                    {error, {insert_exception, Error}}
            end;
        {error, Reason} ->
            io:format("Cannot get ScyllaDB client: ~p~n", [Reason]),
            {error, {client_unavailable, Reason}}
    end.

%% 테스트 메시지 조회
get_test_messages() ->
    io:format("~n=== GET TEST MESSAGES ===~n"),
    case get_client() of
        {ok, Client} ->
            try
                SelectQuery = "SELECT id, user_id, content, created_at FROM contestapp.test_messages;",
                io:format("[DEBUG] Running select query: ~s~n", [SelectQuery]),
                
                case cqerl:run_query(Client, SelectQuery) of
                    {ok, Result} ->
                        Messages = cqerl:all_rows(Result),
                        io:format("Retrieved ~p test messages~n", [length(Messages)]),
                        
                        % 메시지 출력
                        lists:foreach(fun(Row) ->
                            Id = proplists:get_value(id, Row, <<"unknown">>),
                            UserId = proplists:get_value(user_id, Row, <<"unknown">>),
                            Content = proplists:get_value(content, Row, <<"unknown">>),
                            CreatedAt = proplists:get_value(created_at, Row, 0),
                            
                            io:format("  Message:~n"),
                            io:format("    ID: ~s~n", [Id]),
                            io:format("    User ID: ~s~n", [UserId]),
                            io:format("    Content: ~s~n", [Content]),
                            io:format("    Created At: ~p~n", [CreatedAt])
                        end, Messages),
                        
                        logger_util:info(undefined, undefined, "Retrieved ~p test messages from ScyllaDB", [length(Messages)]),
                        {ok, Messages};
                    {error, Reason} ->
                        io:format("Failed to get test messages: ~p~n", [Reason]),
                        logger_util:error(undefined, undefined, "Failed to get test messages: ~p", [Reason]),
                        {error, {select_failed, Reason}}
                end
            catch
                Class:Error:Stacktrace ->
                    io:format("Get test messages error: ~p:~p~n", [Class, Error]),
                    io:format("Stacktrace: ~p~n", [Stacktrace]),
                    logger_util:error(undefined, undefined, "Get test messages exception: ~p:~p", [Class, Error]),
                    {error, {select_exception, Error}}
            end;
        {error, Reason} ->
            io:format("Cannot get ScyllaDB client: ~p~n", [Reason]),
            {error, {client_unavailable, Reason}}
    end.

%% UTF-8 바이너리 안전 변환 (websocket_handler.erl 방식 참고)
ensure_utf8_binary(Data) when is_binary(Data) ->
    case unicode:characters_to_binary(Data, utf8, utf8) of
        Data when is_binary(Data) -> 
            % 이미 올바른 UTF-8 바이너리
            Data;
        ValidUtf8 when is_binary(ValidUtf8) -> 
            % UTF-8로 변환됨
            ValidUtf8;
        {error, InvalidPart, RestData} ->
            % UTF-8 변환 실패 - Latin-1로 시도
            io:format("[WARN] UTF-8 conversion failed for ~p, trying Latin-1. Invalid: ~p, Rest: ~p~n", 
                     [Data, InvalidPart, RestData]),
            case unicode:characters_to_binary(Data, latin1, utf8) of
                ValidFromLatin1 when is_binary(ValidFromLatin1) ->
                    ValidFromLatin1;
                _ ->
                    Data  % 최후의 수단으로 원본 사용
            end;
        {incomplete, _, _} ->
            % 불완전한 UTF-8
            io:format("[WARN] Incomplete UTF-8 in data: ~p~n", [Data]),
            Data
    end;
ensure_utf8_binary(Data) when is_list(Data) ->
    % 문자열을 바이너리로 변환 후 UTF-8 처리
    ensure_utf8_binary(list_to_binary(Data));
ensure_utf8_binary(Data) ->
    % 다른 타입은 문자열로 변환 후 처리
    ensure_utf8_binary(io_lib:format("~p", [Data])).

%% 리소스 정리
cleanup() ->
    try
        case ets:lookup(scylla_clients, default_client) of
            [] ->
                io:format("ScyllaDB client was not initialized~n"),
                ok;
            [{default_client, _Client}] ->
                % cqerl 클라이언트는 자동으로 정리됨
                ets:delete(scylla_clients, default_client),
                io:format("ScyllaDB client cleared from ETS table~n"),
                logger_util:info(undefined, undefined, "ScyllaDB connection cleaned up"),
                ok
        end
    catch
        error:badarg ->
            io:format("ScyllaDB ETS table does not exist~n"),
            ok
    end.