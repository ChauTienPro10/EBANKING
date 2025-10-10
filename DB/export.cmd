@echo off
echo ============================================
echo   Backing up MySQL from Docker container
echo ============================================

REM Step 1: Dump MySQL data into /tmp/backup.sql inside container
docker exec mysql-ebanking-container sh -c "mysqldump -u root -proot@123 --all-databases > /tmp/backup.sql"

IF %ERRORLEVEL% NEQ 0 (
    echo Failed to create MySQL dump inside container.
    pause
    exit /b 1
)

REM Step 2: Copy the backup.sql file from container to host machine
docker cp mysql-ebanking-container:/tmp/backup.sql sql-dump\backup.sql

IF %ERRORLEVEL% NEQ 0 (
    echo Failed to copy backup.sql from container.
    pause
    exit /b 1
)

echo Backup successful! File saved to sql-dump\backup.sql
echo.

pause
