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
cd /d "%~dp0DB"
IF EXIST docker-compose.yml (
    docker-compose up -d
    echo Docker mysql containers started.
) ELSE (
    echo ERROR: docker-compose.yml not found in DB
    pause
    exit /b 1
)

:: i redis
echo.
echo === Starting Docker Compose in ./REDIS ===
cd /d "%~dp0REDiS"
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
cd /d "%~dp0KAFKA"
IF EXIST docker-compose.yml (
    docker-compose up -d
    echo Docker kafka containers started.
) ELSE (
    echo ERROR: docker-compose.yml not found in DB
    pause
    exit /b 1
)

:: i NGINX-BE
echo.
echo === Starting Docker Compose in ./NGINX-BE ===
cd /d "%~dp0NGINX-BE"
IF EXIST docker-compose.yml (
    docker-compose up -d
    echo Docker kafka containers started.
) ELSE (
    echo ERROR: docker-compose.yml not found in NGINX-BE
    pause
    exit /b 1
)

:: Đi vào thư mục dự án web và cài npm
echo.
echo === Starting install web package ===
cd /d "%~dp0FRONTEND\ebanking-fe"

IF EXIST package.json (
    echo Running npm install...
    call npm install

    IF %ERRORLEVEL% LEQ 1 (
        echo npm install thành công!
    ) ELSE (
        echo  npm install bị lỗi với mã lỗi %ERRORLEVEL%.
        pause
        exit /b 1
    )
) ELSE (
    echo  ERROR: package.json not found in ebanking-fe
    pause
    exit /b 1
)

:: Đi vào thư mục dự án mobile và cài npm
echo.
echo === Starting install mobile package ===
cd /d "%~dp0MOBILE\ebanking-mb"
IF EXIST package.json (
    echo Running npm install...
    call npm install

    IF %ERRORLEVEL% LEQ 1 (
        echo npm install thanh cong
    ) ELSE (
        echo  npm install bị lỗi với mã lỗi %ERRORLEVEL%.
        pause
        exit /b 1
    )
) ELSE (
    echo  ERROR: package.json not found in ebanking-fe
    pause
    exit /b 1
)

endlocal
pause
