@echo off
setlocal enabledelayedexpansion

REM === Config ===
set DOCKER_USERNAME=tien22012003
set TAG=1.0

REM === Build all services in ..\docker-build-services
for /d %%d in ("..\docker-build-services\*") do (
    if exist "%%d\Dockerfile" (
        set "SERVICE_NAME=%%~nd"

        REM Convert SERVICE_NAME to lowercase using PowerShell
        for /f %%i in ('powershell -NoProfile -Command "'!SERVICE_NAME!'.ToLower()"') do set "SERVICE_NAME_LOWER=%%i"

        echo.
        echo ================================
        echo Building service: !SERVICE_NAME_LOWER!
        echo ================================

        docker build -t %DOCKER_USERNAME%/!SERVICE_NAME_LOWER!:%TAG% "%%d"
        if errorlevel 1 (
            echo ❌ Build failed for !SERVICE_NAME_LOWER!
            exit /b 1
        )
        echo ✅ Built image: %DOCKER_USERNAME%/!SERVICE_NAME_LOWER!:%TAG%
    )
)

echo.
echo 🎉 All services built successfully!
endlocal
