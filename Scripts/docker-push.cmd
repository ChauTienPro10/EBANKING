@echo off
setlocal enabledelayedexpansion

REM Kiểm tra có tham số không
if "%~1"=="" (
    echo Chua truyen VERSION. Vi du: docker-push.cmd 1.0
    exit /b 1
)

set VERSION=%~1
set DOCKER_USER=tien22012003

REM Danh sach service
set SERVICES=authservice userservice emailservice firebaseservice transactionservice 

echo =================================
echo 🔹 Docker Login
echo =================================
docker login

for %%S in (%SERVICES%) do (
    echo =================================
    echo 🔹 Pushing service: %%S with tag %VERSION%
    echo =================================
    docker push %DOCKER_USER%/%%S:%VERSION%
    if errorlevel 1 (
        echo Push failed for %%S
        exit /b 1
    ) else (
        echo Push success for %%S
    )
)

echo =================================
echo All images pushed successfully with tag %VERSION%!
echo =================================
endlocal
