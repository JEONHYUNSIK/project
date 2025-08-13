FROM ubuntu:latest

# 비대화형 모드 설정
ENV DEBIAN_FRONTEND=noninteractive

# 작업 디렉토리 설정
WORKDIR /app

# 기본 패키지 및 빌드 도구 설치
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    autoconf \
    libssl-dev \
    libncurses-dev \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# asdf 설치
RUN git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.14.0

# asdf 환경 설정
ENV PATH="/root/.asdf/bin:/root/.asdf/shims:$PATH"
RUN echo '. "$HOME/.asdf/asdf.sh"' >> ~/.bashrc
RUN echo '. "$HOME/.asdf/completions/asdf.bash"' >> ~/.bashrc

# Erlang 플러그인 추가 및 설치
RUN /root/.asdf/bin/asdf plugin add erlang
RUN /root/.asdf/bin/asdf install erlang latest
RUN /root/.asdf/bin/asdf global erlang latest

# rebar3 플러그인 추가 및 설치
RUN /root/.asdf/bin/asdf plugin add rebar
RUN /root/.asdf/bin/asdf install rebar latest
RUN /root/.asdf/bin/asdf global rebar latest

# asdf 환경 재설정
RUN /root/.asdf/bin/asdf reshim

# 의존성 파일 복사
COPY rebar.config rebar.lock ./

# 의존성 다운로드 및 컴파일
RUN /root/.asdf/shims/rebar3 get-deps
RUN /root/.asdf/shims/rebar3 compile

# 소스 코드 복사
COPY src/ ./src/

# 애플리케이션 컴파일
RUN /root/.asdf/shims/rebar3 compile

# 포트 노출
EXPOSE 8085

# 애플리케이션 실행
CMD ["sh", "-c", "ls -la _build/default/lib/*/ebin && /root/.asdf/shims/erl -noinput -pa _build/default/lib/*/ebin -eval \"io:format(\\\"Starting chat service...~n\\\"), case application:ensure_all_started(chat_service) of {ok, Started} -> io:format(\\\"Chat service successfully started with apps: ~p~n\\\", [Started]); {error, Reason} -> io:format(\\\"Failed to start chat service: ~p~n\\\", [Reason]) end, timer:sleep(infinity)\""] 