@echo off
echo ============================================
echo   Importing MySQL data into container
echo ============================================

REM Kiểm tra file backup.sql có tồn tại không
IF NOT EXIST "sql-dump\backup.sql" (
    echo File sql-dump\backup.sql không tồn tại!
    pause
    exit /b 1
)

REM Copy file backup.sql vào container
docker cp sql-dump\backup.sql mysql-ebanking-container:/tmp/backup.sql

IF %ERRORLEVEL% NEQ 0 (
    echo Lỗi khi copy file backup.sql vào container.
    pause
    exit /b 1
)

REM Import vào MySQL bên trong container
docker exec -i mysql-ebanking-container sh -c "mysql -u root -proot@123 < /tmp/backup.sql"

IF %ERRORLEVEL% NEQ 0 (
    echo Lỗi khi import dữ liệu vào MySQL.
    pause
    exit /b 1
)

echo Import thành công!
echo.

pause
