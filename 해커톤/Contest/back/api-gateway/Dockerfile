# .NET SDK 이미지를 사용하여 런타임과 도구를 포함합니다.
FROM mcr.microsoft.com/dotnet/sdk:9.0

WORKDIR /app

# 게이트웨이가 실행될 포트를 8080으로 노출합니다.
EXPOSE 8080

# 먼저 프로젝트 파일을 복사하고 의존성을 복원하여 Docker 레이어 캐싱을 활용합니다.
COPY *.fsproj .
RUN dotnet restore

# 나머지 애플리케이션 파일을 복사합니다.
COPY . .

# 파일 변경 시 자동으로 리빌드하는 dotnet watch를 사용하여 애플리케이션을 실행합니다.
CMD ["dotnet", "watch", "run"]