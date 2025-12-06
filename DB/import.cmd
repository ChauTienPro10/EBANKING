@echo off
echo ============================================
echo   Importing MySQL databases to server
echo ============================================

REM Thông tin server MySQL
SET HOST=127.0.0.1
SET PORT=3306
SET USER=root
SET PASSWORD=root@123

REM Thư mục chứa các file backup
SET BACKUP_FOLDER=sql-dump

REM Duyệt tất cả file .sql trong thư mục backup
FOR %%F IN (%BACKUP_FOLDER%\*.sql) DO (
    REM Lấy tên database từ file (filename không có .sql)
    SET "DBNAME=%%~nF"
    echo --------------------------------------------
    echo Importing database %%~nF into server %HOST%...

    REM Tạo database nếu chưa tồn tại
    mysql -h %HOST% -P %PORT% -u %USER% -p%PASSWORD% -e "CREATE DATABASE IF NOT EXISTS `%%~nF` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

    REM Import file .sql
    mysql -h %HOST% -P %PORT% -u %USER% -p%PASSWORD% %%~nF < "%%F"

    IF %ERRORLEVEL% NEQ 0 (
        echo Failed to import %%~nF
        pause
        exit /b 1
    )

    echo Database %%~nF imported successfully!
)

echo.
echo All databases imported successfully!
pause
