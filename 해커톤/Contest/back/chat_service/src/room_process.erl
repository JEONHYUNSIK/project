%%%-------------------------------------------------------------------
%% @doc Room Process - 개별 채팅방 관리 프로세스
%% API 문서 명세:
%% - Room 상태: creating → active → idle → closing → closed
%% - 마지막 사용자 퇴장 시 idle → 타이머 시작 (30분)
%% - 타이머 만료 시 closing → closed
%% @end
%%%-------------------------------------------------------------------

-module(room_process).

-behaviour(gen_server).

-export([
    start_link/1,
    stop/1,
    join_user/2,
    leave_user/2,
    broadcast_message/3,
    get_participants/1,
    get_state/1
]).

-export([
    init/1,
    handle_call/3,
    handle_cast/2,
    handle_info/2,
    terminate/2,
    code_change/3
]).

%% Room 상태 정의
-define(ROOM_STATE_CREATING, creating).
-define(ROOM_STATE_ACTIVE, active).
-define(ROOM_STATE_IDLE, idle).
-define(ROOM_STATE_CLOSING, closing).
-define(ROOM_STATE_CLOSED, closed).

%% 타이머 설정 (30분 = 1800초)
-define(IDLE_TIMEOUT, 1800000).  % 30분 (밀리초)

-record(participant, {
    user_id :: binary(),
    websocket_pid :: pid(),
    joined_at :: integer()
}).

-record(state, {
    chatroom_id :: binary(),
    room_state :: atom(),  % creating | active | idle | closing | closed
    participants :: #{binary() => #participant{}},  % UserId -> Participant
    created_at :: integer(),
    last_activity :: integer(),
    idle_timer :: reference() | undefined
}).

%% API 함수들
start_link(ChatroomId) ->
    gen_server:start_link(?MODULE, [ChatroomId], []).

stop(Pid) ->
    gen_server:cast(Pid, stop).

join_user(Pid, {UserId, WebSocketPid}) ->
    gen_server:call(Pid, {join_user, UserId, WebSocketPid}).

leave_user(Pid, UserId) ->
    gen_server:call(Pid, {leave_user, UserId}).

broadcast_message(Pid, SenderId, Message) ->
    gen_server:cast(Pid, {broadcast_message, SenderId, Message}).

get_participants(Pid) ->
    gen_server:call(Pid, get_participants).

get_state(Pid) ->
    gen_server:call(Pid, get_state).

%% gen_server 콜백들
init([ChatroomId]) ->
    Now = erlang:system_time(second),
    
    InitialState = #state{
        chatroom_id = ChatroomId,
        room_state = ?ROOM_STATE_CREATING,
        participants = #{},
        created_at = Now,
        last_activity = Now,
        idle_timer = undefined
    },
    
    logger_util:info(undefined, ChatroomId, "Room process created"),
    {ok, InitialState}.

%% 사용자 입장 처리
handle_call({join_user, UserId, WebSocketPid}, _From, 
            State = #state{chatroom_id = ChatroomId, participants = Participants, room_state = RoomState}) ->
    
    case RoomState of
        ?ROOM_STATE_CLOSING ->
            % closing 상태에서는 입장 불가
            logger_util:warn(UserId, ChatroomId, "Cannot join room in closing state"),
            {reply, {error, room_closing}, State};
        
        ?ROOM_STATE_CLOSED ->
            % closed 상태에서는 입장 불가
            logger_util:warn(UserId, ChatroomId, "Cannot join room in closed state"),
            {reply, {error, room_closed}, State};
        
        _ ->
            % 기존 참여자인지 확인
            case maps:get(UserId, Participants, undefined) of
                undefined ->
                    % 새로운 참여자
                    NewParticipant = #participant{
                        user_id = UserId,
                        websocket_pid = WebSocketPid,
                        joined_at = erlang:system_time(second)
                    },
                    
                    % WebSocket 프로세스 모니터링
                    monitor(process, WebSocketPid),
                    
                    NewParticipants = maps:put(UserId, NewParticipant, Participants),
                    
                    % Room 상태 전이 처리
                    NewState = case RoomState of
                        ?ROOM_STATE_CREATING ->
                            % 첫 사용자 입장 → active 상태로 전이
                            cancel_idle_timer(State),
                            State#state{
                                room_state = ?ROOM_STATE_ACTIVE,
                                participants = NewParticipants,
                                last_activity = erlang:system_time(second),
                                idle_timer = undefined
                            };
                        ?ROOM_STATE_IDLE ->
                            % idle 상태에서 사용자 입장 → active 상태로 전이
                            cancel_idle_timer(State),
                            State#state{
                                room_state = ?ROOM_STATE_ACTIVE,
                                participants = NewParticipants,
                                last_activity = erlang:system_time(second),
                                idle_timer = undefined
                            };
                        _ ->
                            % active 상태에서는 단순히 참여자 추가
                            State#state{
                                participants = NewParticipants,
                                last_activity = erlang:system_time(second)
                            }
                    end,
                    
                    logger_util:info(UserId, ChatroomId, "User joined room (state: ~p -> ~p)", 
                                   [RoomState, NewState#state.room_state]),
                    
                    % 다른 참여자들에게 입장 알림
                    broadcast_to_others(NewState, UserId, #{
                        <<"type">> => <<"user_joined">>,
                        <<"user_id">> => UserId,
                        <<"room_id">> => ChatroomId,
                        <<"timestamp">> => iso8601_timestamp()
                    }),
                    
                    {reply, {ok, joined}, NewState};
                
                ExistingParticipant ->
                    % 기존 참여자의 재입장 (WebSocket 연결 교체)
                    case is_process_alive(ExistingParticipant#participant.websocket_pid) of
                        true ->
                            % 기존 연결 종료
                            ExistingParticipant#participant.websocket_pid ! {close, session_replaced};
                        false ->
                            ok
                    end,
                    
                    UpdatedParticipant = ExistingParticipant#participant{
                        websocket_pid = WebSocketPid,
                        joined_at = erlang:system_time(second)
                    },
                    
                    monitor(process, WebSocketPid),
                    NewParticipants = maps:put(UserId, UpdatedParticipant, Participants),
                    
                    NewState = State#state{
                        participants = NewParticipants,
                        last_activity = erlang:system_time(second)
                    },
                    
                    logger_util:info(UserId, ChatroomId, "User reconnected to room"),
                    {reply, {ok, reconnected}, NewState}
            end
    end;

%% 사용자 퇴장 처리
handle_call({leave_user, UserId}, _From, 
            State = #state{chatroom_id = ChatroomId, participants = Participants, room_state = RoomState}) ->
    
    case maps:get(UserId, Participants, undefined) of
        undefined ->
            % 존재하지 않는 사용자
            {reply, {error, user_not_found}, State};
        
        _Participant ->
            % 참여자 제거
            NewParticipants = maps:remove(UserId, Participants),
            
            % 다른 참여자들에게 퇴장 알림
            broadcast_to_others(State#state{participants = NewParticipants}, UserId, #{
                <<"type">> => <<"user_left">>,
                <<"user_id">> => UserId,
                <<"room_id">> => ChatroomId,
                <<"timestamp">> => iso8601_timestamp()
            }),
            
            logger_util:info(UserId, ChatroomId, "User left room"),
            
            % 남은 사용자가 없는지 확인
            case maps:size(NewParticipants) of
                0 ->
                    % 마지막 사용자 퇴장 → idle 상태로 전이 및 타이머 시작
                    NewState = case RoomState of
                        ?ROOM_STATE_ACTIVE ->
                            Timer = erlang:send_after(?IDLE_TIMEOUT, self(), idle_timeout),
                            State#state{
                                room_state = ?ROOM_STATE_IDLE,
                                participants = NewParticipants,
                                last_activity = erlang:system_time(second),
                                idle_timer = Timer
                            };
                        _ ->
                            State#state{
                                participants = NewParticipants,
                                last_activity = erlang:system_time(second)
                            }
                    end,
                    
                    logger_util:info(undefined, ChatroomId, "Room is now empty (state: ~p -> ~p)", 
                                   [RoomState, NewState#state.room_state]),
                    {reply, {ok, room_empty}, NewState};
                
                _ ->
                    % 아직 참여자가 남아있음
                    NewState = State#state{
                        participants = NewParticipants,
                        last_activity = erlang:system_time(second)
                    },
                    {reply, {ok, left}, NewState}
            end
    end;

%% 참여자 목록 조회
handle_call(get_participants, _From, State = #state{participants = Participants}) ->
    ParticipantList = maps:fold(
        fun(UserId, Participant, Acc) ->
            [#{
                <<"user_id">> => UserId,
                <<"joined_at">> => Participant#participant.joined_at
            } | Acc]
        end,
        [],
        Participants
    ),
    {reply, ParticipantList, State};

%% Room 상태 조회
handle_call(get_state, _From, State = #state{chatroom_id = ChatroomId, room_state = RoomState, 
                                             participants = Participants, created_at = CreatedAt}) ->
    StateInfo = #{
        <<"chatroom_id">> => ChatroomId,
        <<"room_state">> => atom_to_binary(RoomState, utf8),
        <<"participant_count">> => maps:size(Participants),
        <<"created_at">> => CreatedAt,
        <<"last_activity">> => State#state.last_activity
    },
    {reply, StateInfo, State};

handle_call(_Request, _From, State) ->
    {reply, {error, unknown_request}, State}.

%% 메시지 브로드캐스팅
handle_cast({broadcast_message, SenderId, Message}, 
            State = #state{chatroom_id = ChatroomId, participants = Participants, room_state = RoomState}) ->
    
    case RoomState of
        ?ROOM_STATE_ACTIVE ->
            % active 상태에서만 메시지 전송
            broadcast_to_all(State, #{
                <<"type">> => <<"chat_message">>,
                <<"sender_id">> => SenderId,
                <<"room_id">> => ChatroomId,
                <<"content">> => Message,
                <<"timestamp">> => iso8601_timestamp()
            }),
            
            logger_util:info(SenderId, ChatroomId, "Message broadcasted to ~p participants", 
                           [maps:size(Participants)]),
            
            NewState = State#state{last_activity = erlang:system_time(second)},
            {noreply, NewState};
        
        _ ->
            % 다른 상태에서는 메시지 전송 불가
            logger_util:warn(SenderId, ChatroomId, "Cannot broadcast message in state: ~p", [RoomState]),
            {noreply, State}
    end;

%% Room 프로세스 중지
handle_cast(stop, State = #state{chatroom_id = ChatroomId}) ->
    logger_util:info(undefined, ChatroomId, "Room process stopping"),
    {stop, normal, State};

handle_cast(_Msg, State) ->
    {noreply, State}.

%% idle 타임아웃 처리
handle_info(idle_timeout, State = #state{chatroom_id = ChatroomId, room_state = ?ROOM_STATE_IDLE}) ->
    % idle 상태에서 타임아웃 → closing 상태로 전이
    logger_util:info(undefined, ChatroomId, "Idle timeout - transitioning to closing state"),
    
    NewState = State#state{
        room_state = ?ROOM_STATE_CLOSING,
        idle_timer = undefined
    },
    
    % 즉시 closed 상태로 전이하고 프로세스 종료
    FinalState = NewState#state{room_state = ?ROOM_STATE_CLOSED},
    
    logger_util:info(undefined, ChatroomId, "Room closed due to inactivity"),
    
    % RoomManager에게 제거 요청
    room_manager:remove_room(ChatroomId),
    
    {stop, normal, FinalState};

%% WebSocket 프로세스 종료 감지
handle_info({'DOWN', _Ref, process, Pid, Reason}, 
            State = #state{chatroom_id = ChatroomId, participants = Participants}) ->
    
    % 종료된 WebSocket에 해당하는 사용자 찾기
    case find_user_by_websocket(Pid, Participants) of
        {ok, UserId} ->
            logger_util:info(UserId, ChatroomId, "WebSocket process terminated: ~p", [Reason]),
            % 해당 사용자를 자동으로 퇴장 처리
            {reply, _, NewState} = handle_call({leave_user, UserId}, self(), State),
            {noreply, NewState};
        not_found ->
            {noreply, State}
    end;

handle_info(_Info, State) ->
    {noreply, State}.

terminate(_Reason, #state{chatroom_id = ChatroomId, idle_timer = Timer}) ->
    % 타이머 정리
    cancel_idle_timer_ref(Timer),
    logger_util:info(undefined, ChatroomId, "Room process terminated"),
    ok.

code_change(_OldVsn, State, _Extra) ->
    {ok, State}.

%% 내부 함수들

%% 모든 참여자에게 메시지 브로드캐스트
broadcast_to_all(#state{participants = Participants}, Message) ->
    EncodedMessage = jsx:encode(Message),
    maps:fold(
        fun(_UserId, Participant, _Acc) ->
            case is_process_alive(Participant#participant.websocket_pid) of
                true ->
                    Participant#participant.websocket_pid ! {broadcast, EncodedMessage};
                false ->
                    ok
            end
        end,
        ok,
        Participants
    ).

%% 특정 사용자를 제외한 모든 참여자에게 메시지 브로드캐스트
broadcast_to_others(#state{participants = Participants}, ExcludeUserId, Message) ->
    EncodedMessage = jsx:encode(Message),
    maps:fold(
        fun(UserId, Participant, _Acc) ->
            case UserId =/= ExcludeUserId of
                true ->
                    case is_process_alive(Participant#participant.websocket_pid) of
                        true ->
                            Participant#participant.websocket_pid ! {broadcast, EncodedMessage};
                        false ->
                            ok
                    end;
                false ->
                    ok
            end
        end,
        ok,
        Participants
    ).

%% WebSocket PID로 사용자 찾기
find_user_by_websocket(Pid, Participants) ->
    case maps:fold(
        fun(UserId, Participant, Acc) ->
            case Participant#participant.websocket_pid =:= Pid of
                true -> {found, UserId};
                false -> Acc
            end
        end,
        not_found,
        Participants
    ) of
        {found, UserId} -> {ok, UserId};
        not_found -> not_found
    end.

%% idle 타이머 취소
cancel_idle_timer(#state{idle_timer = Timer}) ->
    cancel_idle_timer_ref(Timer).

cancel_idle_timer_ref(undefined) ->
    ok;
cancel_idle_timer_ref(Timer) ->
    erlang:cancel_timer(Timer),
    ok.

%% ISO8601 타임스탬프 생성
iso8601_timestamp() ->
    {{Year, Month, Day}, {Hour, Minute, Second}} = calendar:universal_time(),
    iolist_to_binary(io_lib:format("~4..0w-~2..0w-~2..0wT~2..0w:~2..0w:~2..0wZ", 
                                   [Year, Month, Day, Hour, Minute, Second])). 