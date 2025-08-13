%%%-------------------------------------------------------------------
%% @doc WebSocket 핸들러 - 인증 및 실시간 채팅 처리
%% @end
%%%-------------------------------------------------------------------

-module(websocket_handler).

-export([
    init/2,
    websocket_init/1,
    websocket_handle/2,
    websocket_info/2,
    terminate/3
]).

-record(state, {
    user_id :: binary(),
    room_id :: binary() | undefined,
    session_data :: map(),
    authenticated :: boolean()
}).

%% HTTP 요청에서 WebSocket으로 업그레이드
init(Req0, _State) ->
    Method = cowboy_req:method(Req0),
    Path = cowboy_req:path(Req0),
    Headers = cowboy_req:headers(Req0),
    
    % 요청 정보 로깅
    io:format("~n=== WEBSOCKET HANDLER REQUEST ===~n"),
    io:format("Method: ~p~n", [Method]),
    io:format("Path: ~p~n", [Path]),
    io:format("Headers: ~p~n", [Headers]),
    io:format("==================================~n"),
    
    io:format("[DEBUG] WebSocket upgrade request received~n"),
    
    % 쿠키에서 JWT 토큰 추출
    case auth_module:extract_token_from_cookie(Req0) of
        {ok, Token} ->
            io:format("[DEBUG] Token extracted successfully for WebSocket~n"),
            % JWT 토큰 검증
            case auth_module:validate_token(Token) of
                {ok, UserId, _Claims} ->
                    io:format("[DEBUG] JWT validation successful for user: ~p~n", [UserId]),
                    % Redis에서 토큰 존재 여부 확인
                    case auth_module:verify_token_in_redis(Token) of
                        {ok, UserId, SessionData} ->
                            % 인증 성공 - WebSocket 업그레이드
                            io:format("[DEBUG] WebSocket authentication successful for user: ~p~n", [UserId]),
                            logger_util:info(UserId, undefined, "WebSocket authentication successful"),
                            
                            InitialState = #state{
                                user_id = UserId,
                                session_data = SessionData,
                                authenticated = true
                            },
                            
                            % 세션 매니저에 등록
                            session_manager:register_session(UserId, self()),
                            
                            {cowboy_websocket, Req0, InitialState};
                        {error, Reason} ->
                            % Redis 인증 실패
                            io:format("[DEBUG] Redis authentication failed for WebSocket: ~p~n", [Reason]),
                            logger_util:error(UserId, undefined, "Redis authentication failed: ~p", [Reason]),
                            handle_auth_failure(Req0, "Redis authentication failed")
                    end;
                {error, Reason} ->
                    % JWT 토큰 검증 실패
                    io:format("[DEBUG] JWT validation failed for WebSocket: ~p~n", [Reason]),
                    logger_util:error(undefined, undefined, "JWT validation failed: ~p", [Reason]),
                    handle_auth_failure(Req0, "JWT token validation failed")
            end;
        {error, no_token} ->
            % 토큰 없음
            io:format("[DEBUG] No JWT token found in cookies for WebSocket~n"),
            logger_util:error(undefined, undefined, "No JWT token found in cookies"),
            handle_auth_failure(Req0, "No JWT token provided")
    end.

%% 인증 실패 처리
handle_auth_failure(Req0, Message) ->
    io:format("[DEBUG] WebSocket authentication failed: ~s~n", [Message]),
    
    Body = jsx:encode(#{
        <<"error">> => <<"invalid_token">>,
        <<"message">> => list_to_binary(Message)
    }),
    
    Req = cowboy_req:reply(401, #{
        <<"content-type">> => <<"application/json">>,
        <<"access-control-allow-origin">> => <<"http://localhost:3000">>,
        <<"access-control-allow-credentials">> => <<"true">>,
        <<"access-control-allow-methods">> => <<"GET, POST, OPTIONS">>,
        <<"access-control-allow-headers">> => <<"Content-Type, Authorization">>
    }, Body, Req0),
    
    {ok, Req, undefined}.

%% WebSocket 연결 초기화
websocket_init(State = #state{user_id = UserId}) ->
    io:format("[DEBUG] WebSocket connection established for user: ~p~n", [UserId]),
    logger_util:info(UserId, undefined, "WebSocket connection established"),
    
    % 환영 메시지 전송
    WelcomeMsg = jsx:encode(#{
        <<"type">> => <<"connection_established">>,
        <<"message">> => <<"WebSocket connection successful">>,
        <<"user_id">> => UserId,
        <<"timestamp">> => iso8601_timestamp()
    }),
    
    % 환영 메시지 인코딩 확인
    check_outgoing_encoding(WelcomeMsg),
    
    {[{text, WelcomeMsg}], State}.

%% 클라이언트로부터 메시지 수신 처리
websocket_handle({text, Msg}, State = #state{user_id = UserId}) ->
    % 받은 메시지의 상세 정보 로깅
    io:format("~n=== MESSAGE ENCODING ANALYSIS ===~n"),
    io:format("[DEBUG] Raw message type: ~p~n", [Msg]),
    io:format("[DEBUG] Raw message size: ~p bytes~n", [byte_size(Msg)]),
    io:format("[DEBUG] Raw message bytes: ~p~n", [binary_to_list(Msg)]),
    
    % 인코딩 추론
    analyze_encoding(Msg),
    
    % UTF-8 검증 및 수정
    SafeMsg = case unicode:characters_to_binary(Msg, utf8, utf8) of
        Msg when is_binary(Msg) -> 
            % 이미 올바른 UTF-8 바이너리
            io:format("[DEBUG] Message is already valid UTF-8~n"),
            Msg;
        ValidUtf8 when is_binary(ValidUtf8) -> 
            % UTF-8로 변환됨
            io:format("[DEBUG] Message converted to valid UTF-8~n"),
            ValidUtf8;
        {error, InvalidPart, RestData} ->
            % UTF-8 변환 실패 - Latin-1로 시도해보기
            io:format("[WARN] UTF-8 conversion failed, trying Latin-1. Invalid: ~p, Rest: ~p~n", [InvalidPart, RestData]),
            case unicode:characters_to_binary(Msg, latin1, utf8) of
                ValidFromLatin1 when is_binary(ValidFromLatin1) ->
                    io:format("[DEBUG] Successfully converted from Latin-1 to UTF-8~n"),
                    ValidFromLatin1;
                _ ->
                    io:format("[WARN] Latin-1 conversion also failed, using original~n"),
                    Msg
            end;
        {incomplete, _, _} ->
            % 불완전한 UTF-8
            io:format("[WARN] Incomplete UTF-8 in message, using original~n"),
            Msg
    end,
    
    io:format("[DEBUG] WebSocket message received from user ~s: ~s~n", [UserId, SafeMsg]),
    io:format("[DEBUG] Final message bytes: ~p~n", [binary_to_list(SafeMsg)]),
    
    try
        % JSX 디코딩
        case jsx:decode(SafeMsg, [return_maps]) of
            #{<<"type">> := Type} = Message ->
                io:format("[DEBUG] Received message type: ~p~n", [Type]),
                logger_util:info(UserId, undefined, "Received message type: ~p", [Type]),
                handle_message(Type, Message, State);
            _ ->
                io:format("[DEBUG] Invalid message format: ~s~n", [SafeMsg]),
                ErrorMsg1 = jsx:encode(#{
                    <<"error">> => <<"invalid_message_format">>,
                    <<"message">> => <<"Message must contain 'type' field">>,
                    <<"timestamp">> => iso8601_timestamp()
                }),
                
                % invalid format 에러 메시지 인코딩 확인
                check_outgoing_encoding(ErrorMsg1),
                
                {[{text, ErrorMsg1}], State}
        end
    catch
        Class:Error:Stacktrace ->
            io:format("[DEBUG] Message parsing error: ~p:~p~n", [Class, Error]),
            io:format("[DEBUG] Stacktrace: ~p~n", [Stacktrace]),
            io:format("[DEBUG] Problematic message: ~p~n", [SafeMsg]),
            logger_util:error(UserId, undefined, "Message parsing error: ~p:~p", [Class, Error]),
            
            % JSX encode도 실패할 수 있으니 안전하게 처리
            try
                ErrorMsg2 = jsx:encode(#{
                    <<"error">> => <<"message_parse_error">>,
                    <<"message">> => <<"Invalid JSON format">>,
                    <<"timestamp">> => iso8601_timestamp()
                }),
                
                % 에러 메시지 인코딩 확인
                check_outgoing_encoding(ErrorMsg2),
                
                {[{text, ErrorMsg2}], State}
            catch
                _:EncodeError ->
                    io:format("[ERROR] JSX encode also failed: ~p~n", [EncodeError]),
                    % 최후의 수단으로 간단한 에러 메시지
                    SimpleError = <<"{ \"error\": \"parse_error\", \"message\": \"Cannot parse message\" }">>,
                    
                    % 심플 에러 메시지 인코딩 확인
                    check_outgoing_encoding(SimpleError),
                    
                    {[{text, SimpleError}], State}
            end
    end;

websocket_handle(_Data, State) ->
    {[], State}.

%% 메시지 타입별 처리
handle_message(<<"ping">>, _Message, State = #state{user_id = UserId}) ->
    io:format("[DEBUG] Handling ping message from user: ~s~n", [UserId]),
    PongMsg = jsx:encode(#{
        <<"type">> => <<"pong">>,
        <<"user_id">> => UserId,
        <<"timestamp">> => iso8601_timestamp()
    }),
    
    % ping 응답 메시지 인코딩 확인
    check_outgoing_encoding(PongMsg),
    
    {[{text, PongMsg}], State};

handle_message(<<"join_room">>, Message, State = #state{user_id = UserId}) ->
    case maps:get(<<"room_id">>, Message, undefined) of
        undefined ->
            io:format("[DEBUG] Missing room_id in join_room message~n"),
            ErrorMsg = jsx:encode(#{
                <<"error">> => <<"missing_room_id">>,
                <<"message">> => <<"room_id is required to join a room">>,
                <<"timestamp">> => iso8601_timestamp()
            }),
            {[{text, ErrorMsg}], State};
        RoomId ->
            io:format("[DEBUG] User ~s joining room ~s~n", [UserId, RoomId]),
            logger_util:info(UserId, RoomId, "Joining room"),
            
            % Room Manager에서 Room 가져오기 또는 생성
            case room_manager:get_or_create_room(RoomId) of
                {ok, RoomPid} ->
                    % Room 프로세스에 사용자 입장 요청
                    case room_process:join_user(RoomPid, {UserId, self()}) of
                        {ok, _} ->
                            JoinedMsg = jsx:encode(#{
                                <<"type">> => <<"room_joined">>,
                                <<"room_id">> => RoomId,
                                <<"user_id">> => UserId,
                                <<"timestamp">> => iso8601_timestamp()
                            }),
                            
                            NewState = State#state{room_id = RoomId},
                            {[{text, JoinedMsg}], NewState};
                        {error, Reason} ->
                            logger_util:error(UserId, RoomId, "Failed to join room: ~p", [Reason]),
                            ErrorMsg = jsx:encode(#{
                                <<"error">> => <<"join_failed">>,
                                <<"message">> => iolist_to_binary(io_lib:format("Failed to join room: ~p", [Reason])),
                                <<"timestamp">> => iso8601_timestamp()
                            }),
                            {[{text, ErrorMsg}], State}
                    end;
                {error, Reason} ->
                    logger_util:error(UserId, RoomId, "Failed to get or create room: ~p", [Reason]),
                    ErrorMsg = jsx:encode(#{
                        <<"error">> => <<"room_error">>,
                        <<"message">> => iolist_to_binary(io_lib:format("Room error: ~p", [Reason])),
                        <<"timestamp">> => iso8601_timestamp()
                    }),
                    {[{text, ErrorMsg}], State}
            end
    end;

handle_message(<<"leave_room">>, _Message, State = #state{user_id = UserId, room_id = RoomId}) ->
    case RoomId of
        undefined ->
            ErrorMsg = jsx:encode(#{
                <<"error">> => <<"not_in_room">>,
                <<"message">> => <<"Not currently in any room">>,
                <<"timestamp">> => iso8601_timestamp()
            }),
            {[{text, ErrorMsg}], State};
        _ ->
            io:format("[DEBUG] User ~s leaving room ~s~n", [UserId, RoomId]),
            logger_util:info(UserId, RoomId, "Leaving room"),
            
            % Room Manager에서 Room 가져오기
            case room_manager:get_room(RoomId) of
                {ok, RoomPid} ->
                    % Room 프로세스에서 사용자 퇴장 요청
                    case room_process:leave_user(RoomPid, UserId) of
                        {ok, _} ->
                            LeftMsg = jsx:encode(#{
                                <<"type">> => <<"room_left">>,
                                <<"room_id">> => RoomId,
                                <<"user_id">> => UserId,
                                <<"timestamp">> => iso8601_timestamp()
                            }),
                            
                            NewState = State#state{room_id = undefined},
                            {[{text, LeftMsg}], NewState};
                        {error, Reason} ->
                            logger_util:error(UserId, RoomId, "Failed to leave room: ~p", [Reason]),
                            ErrorMsg = jsx:encode(#{
                                <<"error">> => <<"leave_failed">>,
                                <<"message">> => iolist_to_binary(io_lib:format("Failed to leave room: ~p", [Reason])),
                                <<"timestamp">> => iso8601_timestamp()
                            }),
                            {[{text, ErrorMsg}], State}
                    end;
                {error, room_not_found} ->
                    % Room이 이미 없음 - 클라이언트 상태만 정리
                    LeftMsg = jsx:encode(#{
                        <<"type">> => <<"room_left">>,
                        <<"room_id">> => RoomId,
                        <<"user_id">> => UserId,
                        <<"message">> => <<"Room no longer exists">>,
                        <<"timestamp">> => iso8601_timestamp()
                    }),
                    
                    NewState = State#state{room_id = undefined},
                    {[{text, LeftMsg}], NewState}
            end
    end;

handle_message(<<"test_message">>, Message, State = #state{user_id = UserId, room_id = RoomId}) ->
    Content = maps:get(<<"content">>, Message, <<"테스트 메시지">>),
    
    % Content 인코딩 분석
    io:format("~n=== CONTENT ENCODING ANALYSIS ===~n"),
    io:format("[CONTENT] Raw content: ~p~n", [Content]),
    case Content of
        _ when is_binary(Content) ->
            io:format("[CONTENT] Content size: ~p bytes~n", [byte_size(Content)]),
            io:format("[CONTENT] Content bytes: ~p~n", [binary_to_list(Content)]),
            analyze_encoding(Content);
        _ ->
            io:format("[CONTENT] Content is not binary: ~p~n", [Content])
    end,
    io:format("=================================~n"),
    
    % Content가 바이너리인지 확인하고, 아니면 기본값 사용
    SafeContent = case Content of
        _ when is_binary(Content) ->
            Content;  % JSX에서 파싱된 바이너리는 이미 올바른 UTF-8
        _ -> 
            <<"[Invalid content type]">>
    end,
    
    % 로그 출력 - 바이너리를 직접 사용 (io:format가 UTF-8 바이너리 처리 가능)
    io:format("[DEBUG] Test message from user ~s in room ~s: ~s~n", [UserId, RoomId, SafeContent]),
    
    EchoMsg = jsx:encode(#{
        <<"type">> => <<"message_echo">>,
        <<"content">> => SafeContent,
        <<"user_id">> => UserId,
        <<"room_id">> => RoomId,
        <<"timestamp">> => iso8601_timestamp()
    }),
    
    % 보내는 메시지 인코딩 확인
    check_outgoing_encoding(EchoMsg),
    
    {[{text, EchoMsg}], State};

handle_message(<<"chat_message">>, Message, State = #state{user_id = UserId, room_id = RoomId}) ->
    case RoomId of
        undefined ->
            ErrorMsg = jsx:encode(#{
                <<"error">> => <<"not_in_room">>,
                <<"message">> => <<"Must join a room before sending messages">>,
                <<"timestamp">> => iso8601_timestamp()
            }),
            {[{text, ErrorMsg}], State};
        _ ->
            Content = maps:get(<<"content">>, Message, <<>>),
            
            case Content of
                <<>> ->
                    ErrorMsg = jsx:encode(#{
                        <<"error">> => <<"empty_message">>,
                        <<"message">> => <<"Message content cannot be empty">>,
                        <<"timestamp">> => iso8601_timestamp()
                    }),
                    {[{text, ErrorMsg}], State};
                _ ->
                    % Content 인코딩 검증
                    SafeContent = case Content of
                        _ when is_binary(Content) ->
                            Content;
                        _ -> 
                            <<"[Invalid content type]">>
                    end,
                    
                    io:format("[DEBUG] Chat message from user ~s in room ~s: ~s~n", [UserId, RoomId, SafeContent]),
                    logger_util:info(UserId, RoomId, "Sending chat message"),
                    
                    % Room Manager에서 Room 가져오기
                    case room_manager:get_room(RoomId) of
                        {ok, RoomPid} ->
                            % Room 프로세스에 메시지 브로드캐스트 요청
                            room_process:broadcast_message(RoomPid, UserId, SafeContent),
                            
                            % 발송 확인 메시지
                            ConfirmMsg = jsx:encode(#{
                                <<"type">> => <<"message_sent">>,
                                <<"room_id">> => RoomId,
                                <<"timestamp">> => iso8601_timestamp()
                            }),
                            
                            {[{text, ConfirmMsg}], State};
                        {error, room_not_found} ->
                            logger_util:error(UserId, RoomId, "Room not found when sending message"),
                            ErrorMsg = jsx:encode(#{
                                <<"error">> => <<"room_not_found">>,
                                <<"message">> => <<"Room no longer exists">>,
                                <<"timestamp">> => iso8601_timestamp()
                            }),
                            
                            % Room이 없으므로 클라이언트 상태 정리
                            NewState = State#state{room_id = undefined},
                            {[{text, ErrorMsg}], NewState}
                    end
            end
    end;

handle_message(Type, _Message, State = #state{user_id = UserId}) ->
    io:format("[DEBUG] Unknown message type: ~p from user: ~s~n", [Type, UserId]),
    logger_util:warn(UserId, undefined, "Unknown message type: ~p", [Type]),
    
    ErrorMsg = jsx:encode(#{
        <<"error">> => <<"unknown_message_type">>,
        <<"message">> => <<"Unknown message type">>,
        <<"type">> => Type,
        <<"timestamp">> => iso8601_timestamp()
    }),
    
    {[{text, ErrorMsg}], State}.

%% WebSocket 정보 메시지 처리
websocket_info(Info, State = #state{user_id = UserId}) ->
    io:format("[DEBUG] WebSocket info received for user ~p: ~p~n", [UserId, Info]),
    case Info of
        {broadcast, Message} ->
            % Room에서 오는 브로드캐스트 메시지
            io:format("[DEBUG] Broadcasting message to user ~s: ~s~n", [UserId, Message]),
            {[{text, Message}], State};
        
        {close, Reason} ->
            io:format("[DEBUG] WebSocket closing for user ~p: ~p~n", [UserId, Reason]),
            {[{close, 1000, <<"Session replaced">>}], State};
        
        _ ->
            {[], State}
    end.

%% WebSocket 연결 종료
terminate(Reason, _Req, _State = #state{user_id = UserId, room_id = RoomId}) ->
    io:format("[DEBUG] WebSocket terminated for user ~s: ~p~n", [UserId, Reason]),
    logger_util:info(UserId, RoomId, "WebSocket connection terminated: ~p", [Reason]),
    
    % Room에서 퇴장 처리 (Room이 있는 경우)
    case RoomId of
        undefined ->
            ok;
        _ ->
            case room_manager:get_room(RoomId) of
                {ok, RoomPid} ->
                    room_process:leave_user(RoomPid, UserId),
                    logger_util:info(UserId, RoomId, "Auto-left room on WebSocket termination");
                {error, _} ->
                    ok
            end
    end,
    
    % 세션 매니저에서 제거
    session_manager:unregister_session(UserId),
    ok.

%% ISO8601 타임스탬프 생성 (바이너리 반환)
iso8601_timestamp() ->
    {{Year, Month, Day}, {Hour, Minute, Second}} = calendar:universal_time(),
    iolist_to_binary(io_lib:format("~4..0w-~2..0w-~2..0wT~2..0w:~2..0w:~2..0wZ", 
                                   [Year, Month, Day, Hour, Minute, Second])).

%% 인코딩 분석 함수
analyze_encoding(Binary) ->
    io:format("[ENCODING] Analyzing message encoding...~n"),
    
    % UTF-8 검증
    case unicode:characters_to_binary(Binary, utf8, utf8) of
        Binary ->
            io:format("[ENCODING] ✓ Message is valid UTF-8~n");
        {error, _, _} ->
            io:format("[ENCODING] ✗ Message is NOT valid UTF-8~n");
        {incomplete, _, _} ->
            io:format("[ENCODING] ⚠ Message has incomplete UTF-8 sequences~n")
    end,
    
    % Latin-1 검증
    case unicode:characters_to_binary(Binary, latin1, utf8) of
        ValidLatin1 when is_binary(ValidLatin1) ->
            io:format("[ENCODING] ✓ Message can be interpreted as Latin-1~n"),
            io:format("[ENCODING] Latin-1 to UTF-8: ~s~n", [ValidLatin1]);
        _ ->
            io:format("[ENCODING] ✗ Message cannot be interpreted as Latin-1~n")
    end,
    
    % 한국어 패턴 검사 (UTF-8에서 한국어 범위: AC00-D7AF)
    check_korean_patterns(Binary),
    
    % 일반적인 한국어 깨짐 패턴 검사
    check_corrupted_korean_patterns(Binary),
    
    io:format("[ENCODING] Analysis complete.~n"),
    io:format("================================~n").

%% 한국어 UTF-8 패턴 검사
check_korean_patterns(Binary) ->
    try
        case unicode:characters_to_list(Binary, utf8) of
            String when is_list(String) ->
                KoreanChars = [C || C <- String, C >= 16#AC00, C =< 16#D7AF],
                case length(KoreanChars) of
                    0 ->
                        io:format("[ENCODING] No Korean characters detected~n");
                    Count ->
                        io:format("[ENCODING] ✓ Found ~p Korean characters: ~p~n", [Count, KoreanChars])
                end;
            _ ->
                io:format("[ENCODING] Cannot convert to character list~n")
        end
    catch
        _:_ ->
            io:format("[ENCODING] Error checking Korean patterns~n")
    end.

%% 깨진 한국어 패턴 검사 (Latin-1로 해석된 UTF-8)
check_corrupted_korean_patterns(Binary) ->
    % "안녕하세요"를 Latin-1로 잘못 해석했을 때 나타나는 패턴들
    CorruptedPatterns = [
        <<"ìëíì¸ì">>,  % "안녕하세요"의 깨진 형태
        <<"í">>        % 한국어가 깨질 때 자주 나타나는 문자
    ],
    
    lists:foreach(fun(Pattern) ->
        case binary:match(Binary, Pattern) of
            nomatch ->
                ok;
            _ ->
                io:format("[ENCODING] ⚠ Found corrupted Korean pattern: ~s~n", [Pattern]),
                io:format("[ENCODING] This suggests UTF-8 bytes interpreted as Latin-1~n")
        end
    end, CorruptedPatterns).

%% 메시지 전송 시 인코딩 확인
check_outgoing_encoding(Message) ->
    io:format("~n=== OUTGOING MESSAGE ENCODING ===~n"),
    io:format("[ENCODING-OUT] Message type: ~p~n", [Message]),
    io:format("[ENCODING-OUT] Message size: ~p bytes~n", [byte_size(Message)]),
    io:format("[ENCODING-OUT] Message bytes: ~p~n", [binary_to_list(Message)]),
    
    % UTF-8 유효성 검사
    case unicode:characters_to_binary(Message, utf8, utf8) of
        Message ->
            io:format("[ENCODING-OUT] ✓ Outgoing message is valid UTF-8~n");
        _ ->
            io:format("[ENCODING-OUT] ⚠ Outgoing message encoding issue~n")
    end,
    
    io:format("=================================~n"). 