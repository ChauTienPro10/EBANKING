@echo off
chcp 65001 >nul

echo.
echo === BẮT ĐẦU BUILD REACT APP ===
echo.

:: Chuyển đến thư mục ebanking-fe (CHÚ Ý: tên đúng là "FRONTEND" hay "FONTEND"?)
cd /d "%~dp0FRONTEND\ebanking-fe"
IF %ERRORLEVEL% NEQ 0 (
    echo Không thể chuyển đến thư mục ebanking-fe.
    pause
    exit /b 1
)

:: Tiến hành build
IF EXIST package.json (
    echo Running npm install...
    call npm install

    IF %ERRORLEVEL% LEQ 1 (
        echo npm install thanh cong
        call npm run build
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

echo BUILD THANH CONG FRONTEND.

echo.

:: Trở về thư mục gốc
cd /d "%~dp0"

:: buile docker network
docker network create ebanking-network

:: Kiểm tra docker-compose.yml
IF NOT EXIST docker-compose.yml (
    echo ERROR: Không tìm thấy file docker-compose.yml
    pause
    exit /b 1
)

echo Đang khởi động Docker Compose...
docker-compose up -d
IF %ERRORLEVEL% NEQ 0 (
    echo Lỗi khi chạy docker-compose.
    pause
    exit /b 1
)

echo Docker Compose đã chạy thành công.
pause
exit /b 0
