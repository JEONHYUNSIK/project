%%%-------------------------------------------------------------------
%% @doc 세션 매니저 - 인증된 연결 상태 관리
%% @end
%%%-------------------------------------------------------------------

-module(session_manager).

-behaviour(gen_server).

-export([
    start_link/0,
    register_session/2,
    unregister_session/1,
    get_session/1,
    get_all_sessions/0,
    check_token_expiry/1,
    cleanup_expired_sessions/0
]).

-export([
    init/1,
    handle_call/3,
    handle_cast/2,
    handle_info/2,
    terminate/2,
    code_change/3
]).

-record(session, {
    user_id :: binary(),
    websocket_pid :: pid(),
    token :: binary(),
    expires_at :: integer(),
    created_at :: integer(),
    last_activity :: integer()
}).

-record(state, {
    sessions :: #{binary() => #session{}},
    cleanup_timer :: reference()
}).

-define(CLEANUP_INTERVAL, 60000).  % 1분마다 정리

%% API 함수들
start_link() ->
    gen_server:start_link({local, ?MODULE}, ?MODULE, [], []).

register_session(UserId, WebSocketPid) ->
    gen_server:call(?MODULE, {register_session, UserId, WebSocketPid}).

unregister_session(UserId) ->
    gen_server:cast(?MODULE, {unregister_session, UserId}).

get_session(UserId) ->
    gen_server:call(?MODULE, {get_session, UserId}).

get_all_sessions() ->
    gen_server:call(?MODULE, get_all_sessions).

check_token_expiry(UserId) ->
    gen_server:call(?MODULE, {check_token_expiry, UserId}).

cleanup_expired_sessions() ->
    gen_server:cast(?MODULE, cleanup_expired_sessions).

%% gen_server 콜백들
init([]) ->
    % 정리 타이머 시작
    Timer = erlang:send_after(?CLEANUP_INTERVAL, self(), cleanup_expired_sessions),
    
    io:format("Session manager started~n"),
    {ok, #state{
        sessions = #{},
        cleanup_timer = Timer
    }}.

handle_call({register_session, UserId, WebSocketPid}, _From, State = #state{sessions = Sessions}) ->
    % 기존 세션이 있으면 정리
    NewSessions = case maps:get(UserId, Sessions, undefined) of
        undefined ->
            Sessions;
        OldSession ->
            % 기존 WebSocket 연결 종료
            case is_process_alive(OldSession#session.websocket_pid) of
                true ->
                    OldSession#session.websocket_pid ! {close, session_replaced};
                false ->
                    ok
            end,
            maps:remove(UserId, Sessions)
    end,
    
    % 새 세션 생성
    Now = erlang:system_time(second),
    Session = #session{
        user_id = UserId,
        websocket_pid = WebSocketPid,
        token = <<>>,  % 토큰은 별도로 업데이트
        expires_at = Now + 3600,  % 1시간 후 만료
        created_at = Now,
        last_activity = Now
    },
    
    % WebSocket 프로세스 모니터링
    monitor(process, WebSocketPid),
    
    FinalSessions = maps:put(UserId, Session, NewSessions),
    
    io:format("[INFO] Session registered for user: ~p~n", [UserId]),
    {reply, ok, State#state{sessions = FinalSessions}};

handle_call({get_session, UserId}, _From, State = #state{sessions = Sessions}) ->
    Result = case maps:get(UserId, Sessions, undefined) of
        undefined ->
            {error, session_not_found};
        Session ->
            {ok, Session}
    end,
    {reply, Result, State};

handle_call(get_all_sessions, _From, State = #state{sessions = Sessions}) ->
    SessionList = maps:values(Sessions),
    {reply, SessionList, State};

handle_call({check_token_expiry, UserId}, _From, State = #state{sessions = Sessions}) ->
    Result = case maps:get(UserId, Sessions, undefined) of
        undefined ->
            {error, session_not_found};
        Session ->
            Now = erlang:system_time(second),
            if
                Session#session.expires_at > Now ->
                    {ok, valid};
                true ->
                    {error, expired}
            end
    end,
    {reply, Result, State};

handle_call(_Request, _From, State) ->
    {reply, {error, unknown_request}, State}.

handle_cast({unregister_session, UserId}, State = #state{sessions = Sessions}) ->
    NewSessions = case maps:get(UserId, Sessions, undefined) of
        undefined ->
            Sessions;
        _Session ->
            io:format("[INFO] Session unregistered for user: ~p~n", [UserId]),
            maps:remove(UserId, Sessions)
    end,
    {noreply, State#state{sessions = NewSessions}};

handle_cast(cleanup_expired_sessions, State = #state{sessions = Sessions}) ->
    Now = erlang:system_time(second),
    
    {ExpiredSessions, ValidSessions} = maps:fold(
        fun(UserId, Session, {Expired, Valid}) ->
            if
                Session#session.expires_at =< Now ->
                    % 만료된 세션
                    case is_process_alive(Session#session.websocket_pid) of
                        true ->
                            Session#session.websocket_pid ! {close, session_expired};
                        false ->
                            ok
                    end,
                    {[UserId | Expired], Valid};
                true ->
                    % 유효한 세션
                    {Expired, maps:put(UserId, Session, Valid)}
            end
        end,
        {[], #{}},
        Sessions
    ),
    
    case length(ExpiredSessions) of
        0 ->
            ok;
        Count ->
            io:format("[INFO] Cleaned up ~p expired sessions~n", [Count])
    end,
    
    {noreply, State#state{sessions = ValidSessions}};

handle_cast(_Msg, State) ->
    {noreply, State}.

handle_info(cleanup_expired_sessions, State) ->
    % 정기적인 정리 작업
    cleanup_expired_sessions(),
    
    % 다음 정리 타이머 설정
    Timer = erlang:send_after(?CLEANUP_INTERVAL, self(), cleanup_expired_sessions),
    {noreply, State#state{cleanup_timer = Timer}};

handle_info({'DOWN', _Ref, process, Pid, _Reason}, State = #state{sessions = Sessions}) ->
    % WebSocket 프로세스가 종료된 경우 세션 정리
    NewSessions = maps:filter(
        fun(_UserId, Session) ->
            Session#session.websocket_pid =/= Pid
        end,
        Sessions
    ),
    
    case maps:size(Sessions) - maps:size(NewSessions) of
        0 ->
            ok;
        RemovedCount ->
            io:format("[INFO] Removed ~p sessions due to WebSocket process termination~n", 
                     [RemovedCount])
    end,
    
    {noreply, State#state{sessions = NewSessions}};

handle_info(_Info, State) ->
    {noreply, State}.

terminate(_Reason, #state{cleanup_timer = Timer}) ->
    % 정리 타이머 취소
    case Timer of
        undefined ->
            ok;
        _ ->
            erlang:cancel_timer(Timer)
    end,
    
    io:format("Session manager terminated~n"),
    ok.

code_change(_OldVsn, State, _Extra) ->
    {ok, State}. 