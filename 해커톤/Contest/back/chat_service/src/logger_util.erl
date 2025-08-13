%%%-------------------------------------------------------------------
%% @doc 로깅 유틸리티 - 구조화된 로깅 시스템
%% @end
%%%-------------------------------------------------------------------

-module(logger_util).

-export([
    error/3, error/4,
    warn/3, warn/4,
    info/3, info/4,
    debug/3, debug/4,
    format_timestamp/0
]).

%% 로그 레벨 정의
-define(LOG_LEVEL_ERROR, 1).
-define(LOG_LEVEL_WARN, 2).
-define(LOG_LEVEL_INFO, 3).
-define(LOG_LEVEL_DEBUG, 4).

%% 현재 로그 레벨 (환경 변수로 설정 가능)
get_log_level() ->
    case os:getenv("LOG_LEVEL") of
        "ERROR" -> ?LOG_LEVEL_ERROR;
        "WARN" -> ?LOG_LEVEL_WARN;
        "INFO" -> ?LOG_LEVEL_INFO;
        "DEBUG" -> ?LOG_LEVEL_DEBUG;
        _ -> ?LOG_LEVEL_INFO  % 기본값
    end.

%% ERROR 레벨 로그
error(UserId, RoomId, Message) ->
    error(UserId, RoomId, Message, []).

error(UserId, RoomId, Message, Args) ->
    log(?LOG_LEVEL_ERROR, "ERROR", UserId, RoomId, Message, Args).

%% WARN 레벨 로그
warn(UserId, RoomId, Message) ->
    warn(UserId, RoomId, Message, []).

warn(UserId, RoomId, Message, Args) ->
    log(?LOG_LEVEL_WARN, "WARN", UserId, RoomId, Message, Args).

%% INFO 레벨 로그
info(UserId, RoomId, Message) ->
    info(UserId, RoomId, Message, []).

info(UserId, RoomId, Message, Args) ->
    log(?LOG_LEVEL_INFO, "INFO", UserId, RoomId, Message, Args).

%% DEBUG 레벨 로그
debug(UserId, RoomId, Message) ->
    debug(UserId, RoomId, Message, []).

debug(UserId, RoomId, Message, Args) ->
    log(?LOG_LEVEL_DEBUG, "DEBUG", UserId, RoomId, Message, Args).

%% 실제 로그 출력 함수
log(Level, LevelStr, UserId, RoomId, Message, Args) ->
    CurrentLevel = get_log_level(),
    
    case Level =< CurrentLevel of
        true ->
            Timestamp = format_timestamp(),
            Pid = self(),
            
            % 사용자 ID와 룸 ID 포맷팅
            UserIdStr = format_optional_field(UserId),
            RoomIdStr = format_optional_field(RoomId),
            
            % 메시지 포맷팅
            FormattedMessage = case Args of
                [] -> Message;
                _ -> io_lib:format(Message, Args)
            end,
            
            % 로그 포맷: [timestamp] [LEVEL] [PID] [userId] [roomId] - message
            LogLine = io_lib:format("[~s] [~s] [~p]~s~s - ~s~n", [
                Timestamp,
                LevelStr,
                Pid,
                UserIdStr,
                RoomIdStr,
                FormattedMessage
            ]),
            
            % 콘솔에 출력
            io:format("~s", [LogLine]),
            
            % ERROR 레벨인 경우 추가 처리 (향후 알림 시스템 연동 가능)
            case Level of
                ?LOG_LEVEL_ERROR ->
                    handle_error_log(FormattedMessage, Pid, UserId, RoomId);
                _ ->
                    ok
            end;
        false ->
            ok
    end.

%% 선택적 필드 포맷팅
format_optional_field(undefined) -> "";
format_optional_field(null) -> "";
format_optional_field(<<>>) -> "";
format_optional_field(Value) when is_binary(Value) ->
    io_lib:format(" [~s]", [Value]);
format_optional_field(Value) when is_list(Value) ->
    io_lib:format(" [~s]", [Value]);
format_optional_field(Value) ->
    io_lib:format(" [~p]", [Value]).

%% 타임스탬프 포맷팅
format_timestamp() ->
    {{Year, Month, Day}, {Hour, Min, Sec}} = calendar:universal_time(),
    Millisec = erlang:system_time(millisecond) rem 1000,
    io_lib:format("~4..0w-~2..0w-~2..0wT~2..0w:~2..0w:~2..0w.~3..0wZ", 
                  [Year, Month, Day, Hour, Min, Sec, Millisec]).

%% ERROR 로그 특별 처리
handle_error_log(Message, Pid, UserId, RoomId) ->
    % 향후 Slack/Email 알림 시스템 연동 가능
    % 현재는 단순히 에러 카운트 등의 메트릭 수집 가능
    ErrorInfo = #{
        message => Message,
        pid => Pid,
        user_id => UserId,
        room_id => RoomId,
        timestamp => erlang:system_time(second)
    },
    
    % 에러 정보를 별도 프로세스나 ETS 테이블에 저장할 수 있음
    % 현재는 단순히 로그만 남김
    io:format("[ERROR_HANDLER] Error logged: ~p~n", [ErrorInfo]),
    ok. 