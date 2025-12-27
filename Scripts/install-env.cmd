@echo off
setlocal

:: Kiểm tra Node.js
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed.
    echo Installing Node.js LTS version via NVM...

    :: Kiểm tra NVM đã cài chưa
    nvm version >nul 2>&1
    IF %ERRORLEVEL% NEQ 0 (
        echo ERROR: NVM is not installed. Please install NVM first: https://github.com/coreybutler/nvm-windows/releases
        exit /b 1
    )

    :: Cài Node.js bản LTS mới (ví dụ: 20.14.0)
    nvm install 20.14.0
    nvm use 20.14.0
    nvm alias default 20.14.0

    echo Node.js 20.14.0 installed and activated.
) ELSE (
    echo Node.js is already installed.
    node -v
)

echo.
:: === 2. Kiểm tra khả năng sử dụng React Native CLI qua npx ===
where npx >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: npx is not available. Please ensure Node.js and npm are properly installed.
    pause
    exit /b 1
) ELSE (
    echo npx is available.
)

 :: Docker check
echo.
echo === Checking Docker ===
docker -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed or not in PATH.
    echo Please install Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
) ELSE (
    echo Docker is installed:
    docker -v
)

:: buile docker network
docker network create ebanking-network

:: docker install
echo.
echo === Starting Docker Compose in ./DB ===
cd /d "%~dp0..\DB"
IF EXIST docker-compose.yml (
    docker-compose up -d
    echo Docker mysql containers started.
) ELSE (
    echo ERROR: docker-compose.yml not found in DB
    pause
    exit /b 1
)

:: i jenkins
echo.
echo === Start Docker compose in ./JENSKINS ===
cd /d "%~dp0..\JENSKINS"
IF EXIST docker-compose.yml (
    docker-compose up -d
    echo Docker jenkins container started.
) ELSE (
    echo ERROR: docker-compose.yml not found in DB
    pause
    exit /b 1
)
echo.
echo === Install Java 17 inside Jenkins container ===

REM Cài Java 17 trong container (Debian/Ubuntu base)
docker exec -it jenkins bash -c "apt-get update && apt-get install -y openjdk-17-jdk && java -version"

echo.
echo === Done ===

echo.
echo === Install maven ===
docker exec -it jenkins bash -c "apt-get update && apt-get install -y maven && mvn -version"
echo.
echo === Done ===


:: i redis
echo.
echo === Starting Docker Compose in ./REDIS ===
cd /d "%~dp0..\REDiS"
IF EXIST docker-compose.yml (
    docker-compose up -d
    echo Docker redis containers started.
) ELSE (
    echo ERROR: docker-compose.yml not found in DB
    pause
    exit /b 1
)

:: i kafka
echo.
echo === Starting Docker Compose in ./KAFKA ===
cd /d "%~dp0..\KAFKA"
IF EXIST docker-compose.yml (
    docker-compose up -d
    echo Docker kafka containers started.
) ELSE (
    echo ERROR: docker-compose.yml not found in DB
    pause
    exit /b 1
)

@REM :: i NGINX-BE
@REM echo.
@REM echo === Starting Docker Compose in ./NGINX-BE ===
@REM cd /d "%~dp0..\NGINX-BE"
@REM IF EXIST docker-compose.yml (
@REM     docker-compose up -d
@REM     echo Docker kafka containers started.
@REM ) ELSE (
@REM     echo ERROR: docker-compose.yml not found in NGINX-BE
@REM     pause
@REM     exit /b 1
@REM )

@REM :: Đi vào thư mục dự án web và cài npm
@REM echo.
@REM echo === Starting install web package ===
@REM cd /d "%~dp0..\FRONTEND\ebanking-fe"

@REM IF EXIST package.json (
@REM     echo Running npm install...
@REM     call npm install

@REM     IF %ERRORLEVEL% LEQ 1 (
@REM         echo npm install thành công!
@REM     ) ELSE (
@REM         echo  npm install bị lỗi với mã lỗi %ERRORLEVEL%.
@REM         pause
@REM         exit /b 1
@REM     )
@REM ) ELSE (
@REM     echo  ERROR: package.json not found in ebanking-fe
@REM     pause
@REM     exit /b 1
@REM )

@REM :: Đi vào thư mục dự án mobile và cài npm
@REM echo.
@REM echo === Starting install mobile package ===
@REM cd /d "%~dp0..\MOBILE\ebanking-mb"
@REM IF EXIST package.json (
@REM     echo Running npm install...
@REM     call npm install

@REM     IF %ERRORLEVEL% LEQ 1 (
@REM         echo npm install thanh cong
@REM     ) ELSE (
@REM         echo  npm install bị lỗi với mã lỗi %ERRORLEVEL%.
@REM         pause
@REM         exit /b 1
@REM     )
@REM ) ELSE (
@REM     echo  ERROR: package.json not found in ebanking-fe
@REM     pause
@REM     exit /b 1
@REM )

endlocal
pause
