%%%-------------------------------------------------------------------
%% @doc Room Manager - 채팅방 프로세스들의 생성 및 관리
%% @end
%%%-------------------------------------------------------------------

-module(room_manager).

-behaviour(gen_server).

-export([
    start_link/0,
    get_or_create_room/1,
    get_room/1,
    remove_room/1,
    list_rooms/0,
    room_exists/1
]).

-export([
    init/1,
    handle_call/3,
    handle_cast/2,
    handle_info/2,
    terminate/2,
    code_change/3
]).

-record(state, {
    rooms :: #{binary() => pid()}  % ChatroomId -> Room PID 매핑
}).

%% API 함수들
start_link() ->
    gen_server:start_link({local, ?MODULE}, ?MODULE, [], []).

%% 채팅방 가져오기 또는 생성
get_or_create_room(ChatroomId) ->
    gen_server:call(?MODULE, {get_or_create_room, ChatroomId}).

%% 채팅방 가져오기 (존재하지 않으면 error)
get_room(ChatroomId) ->
    gen_server:call(?MODULE, {get_room, ChatroomId}).

%% 채팅방 제거
remove_room(ChatroomId) ->
    gen_server:cast(?MODULE, {remove_room, ChatroomId}).

%% 모든 채팅방 목록
list_rooms() ->
    gen_server:call(?MODULE, list_rooms).

%% 채팅방 존재 여부 확인
room_exists(ChatroomId) ->
    gen_server:call(?MODULE, {room_exists, ChatroomId}).

%% gen_server 콜백들
init([]) ->
    io:format("Room Manager started~n"),
    logger_util:info(undefined, undefined, "Room Manager started"),
    {ok, #state{rooms = #{}}}.

handle_call({get_or_create_room, ChatroomId}, _From, State = #state{rooms = Rooms}) ->
    case maps:get(ChatroomId, Rooms, undefined) of
        undefined ->
            % Room이 존재하지 않으면 새로 생성
            case room_process:start_link(ChatroomId) of
                {ok, RoomPid} ->
                    % Room 프로세스 모니터링
                    monitor(process, RoomPid),
                    NewRooms = maps:put(ChatroomId, RoomPid, Rooms),
                    logger_util:info(undefined, ChatroomId, "Room created successfully"),
                    {reply, {ok, RoomPid}, State#state{rooms = NewRooms}};
                {error, Reason} ->
                    logger_util:error(undefined, ChatroomId, "Failed to create room: ~p", [Reason]),
                    {reply, {error, Reason}, State}
            end;
        RoomPid ->
            % Room이 이미 존재함
            case is_process_alive(RoomPid) of
                true ->
                    {reply, {ok, RoomPid}, State};
                false ->
                    % 죽은 프로세스이므로 새로 생성
                    case room_process:start_link(ChatroomId) of
                        {ok, NewRoomPid} ->
                            monitor(process, NewRoomPid),
                            NewRooms = maps:put(ChatroomId, NewRoomPid, Rooms),
                            logger_util:info(undefined, ChatroomId, "Room recreated after process death"),
                            {reply, {ok, NewRoomPid}, State#state{rooms = NewRooms}};
                        {error, Reason} ->
                            NewRooms = maps:remove(ChatroomId, Rooms),
                            logger_util:error(undefined, ChatroomId, "Failed to recreate room: ~p", [Reason]),
                            {reply, {error, Reason}, State#state{rooms = NewRooms}}
                    end
            end
    end;

handle_call({get_room, ChatroomId}, _From, State = #state{rooms = Rooms}) ->
    case maps:get(ChatroomId, Rooms, undefined) of
        undefined ->
            {reply, {error, room_not_found}, State};
        RoomPid ->
            case is_process_alive(RoomPid) of
                true ->
                    {reply, {ok, RoomPid}, State};
                false ->
                    NewRooms = maps:remove(ChatroomId, Rooms),
                    {reply, {error, room_not_found}, State#state{rooms = NewRooms}}
            end
    end;

handle_call(list_rooms, _From, State = #state{rooms = Rooms}) ->
    % 살아있는 Room들만 필터링
    AliveRooms = maps:filter(
        fun(_ChatroomId, RoomPid) ->
            is_process_alive(RoomPid)
        end,
        Rooms
    ),
    
    RoomList = maps:to_list(AliveRooms),
    {reply, RoomList, State#state{rooms = AliveRooms}};

handle_call({room_exists, ChatroomId}, _From, State = #state{rooms = Rooms}) ->
    case maps:get(ChatroomId, Rooms, undefined) of
        undefined ->
            {reply, false, State};
        RoomPid ->
            Exists = is_process_alive(RoomPid),
            case Exists of
                false ->
                    NewRooms = maps:remove(ChatroomId, Rooms),
                    {reply, false, State#state{rooms = NewRooms}};
                true ->
                    {reply, true, State}
            end
    end;

handle_call(_Request, _From, State) ->
    {reply, {error, unknown_request}, State}.

handle_cast({remove_room, ChatroomId}, State = #state{rooms = Rooms}) ->
    case maps:get(ChatroomId, Rooms, undefined) of
        undefined ->
            {noreply, State};
        RoomPid ->
            % Room 프로세스 종료
            case is_process_alive(RoomPid) of
                true ->
                    room_process:stop(RoomPid);
                false ->
                    ok
            end,
            NewRooms = maps:remove(ChatroomId, Rooms),
            logger_util:info(undefined, ChatroomId, "Room removed from manager"),
            {noreply, State#state{rooms = NewRooms}}
    end;

handle_cast(_Msg, State) ->
    {noreply, State}.

handle_info({'DOWN', _Ref, process, Pid, Reason}, State = #state{rooms = Rooms}) ->
    % Room 프로세스가 종료된 경우
    {ChatroomId, NewRooms} = case maps:fold(
        fun(CId, P, {FoundId, Acc}) ->
            if
                P =:= Pid ->
                    {CId, Acc};
                true ->
                    {FoundId, maps:put(CId, P, Acc)}
            end
        end,
        {undefined, #{}},
        Rooms
    ) of
        {undefined, _} ->
            {undefined, Rooms};
        {FoundChatroomId, FilteredRooms} ->
            {FoundChatroomId, FilteredRooms}
    end,
    
    case ChatroomId of
        undefined ->
            {noreply, State};
        _ ->
            logger_util:info(undefined, ChatroomId, "Room process terminated: ~p", [Reason]),
            {noreply, State#state{rooms = NewRooms}}
    end;

handle_info(_Info, State) ->
    {noreply, State}.

terminate(_Reason, #state{rooms = Rooms}) ->
    % 모든 Room 프로세스 종료
    maps:fold(
        fun(_ChatroomId, RoomPid, _Acc) ->
            case is_process_alive(RoomPid) of
                true ->
                    room_process:stop(RoomPid);
                false ->
                    ok
            end
        end,
        ok,
        Rooms
    ),
    
    logger_util:info(undefined, undefined, "Room Manager terminated"),
    ok.

code_change(_OldVsn, State, _Extra) ->
    {ok, State}. 