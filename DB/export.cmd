@echo off
echo ============================================
echo   Backing up MySQL databases with prefix DB_
echo ============================================

REM Tên container MySQL
SET CONTAINER_NAME=mysql-ebanking-container

REM Thư mục lưu backup
SET BACKUP_FOLDER=sql-dump

REM Tạo thư mục nếu chưa có
IF NOT EXIST %BACKUP_FOLDER% (
    mkdir %BACKUP_FOLDER%
)

REM Lấy tất cả database và lọc database có prefix DB_
FOR /F "tokens=*" %%D IN ('docker exec %CONTAINER_NAME% mysql -u root -proot@123 -Bse "SHOW DATABASES;"') DO (
    echo %%D | findstr /B "DB_" >nul
    IF %ERRORLEVEL% EQU 0 (
        echo --------------------------------------------
        echo Backing up database %%D...

        docker exec -i %CONTAINER_NAME% sh -c "mysqldump -u root -proot@123 %%D > /tmp/%%D.sql"
        
        IF %ERRORLEVEL% NEQ 0 (
            echo Failed to dump %%D
            pause
            exit /b 1
        )

        docker cp %CONTAINER_NAME%:/tmp/%%D.sql %BACKUP_FOLDER%\%%D.sql

        IF %ERRORLEVEL% NEQ 0 (
            echo Failed to copy %%D.sql
            pause
            exit /b 1
        )

        echo Database %%D backup successful! File saved to %BACKUP_FOLDER%\%%D.sql
    )
)

echo.
echo All DB_ backups completed successfully!
pause
