@echo off
setlocal

:: Đường dẫn thư mục đích
set OUTPUT_DIR=..\JarFileOutput

:: Tạo thư mục đích nếu chưa tồn tại
if not exist "%OUTPUT_DIR%" (
    mkdir "%OUTPUT_DIR%"
)

:: Xóa sạch các file trong thư mục đích trước khi copy
echo Cleaning up %OUTPUT_DIR%...
del /Q "%OUTPUT_DIR%\*.jar"

:: Copy các file jar từ Docker container về thư mục đích trên máy host
echo Copying authService.jar...
docker cp jenkins:/var/jenkins_home/workspace/EBANKING/output_jar_file/authService.jar "%OUTPUT_DIR%"

echo Copying userService.jar...
docker cp jenkins:/var/jenkins_home/workspace/EBANKING/output_jar_file/userService.jar "%OUTPUT_DIR%"

echo Copying emailService.jar...
docker cp jenkins:/var/jenkins_home/workspace/EBANKING/output_jar_file/emailService.jar "%OUTPUT_DIR%"

echo Copying transactionService.jar...
docker cp jenkins:/var/jenkins_home/workspace/EBANKING/output_jar_file/transactionService.jar "%OUTPUT_DIR%"

echo Copying firebaseService.jar...
docker cp jenkins:/var/jenkins_home/workspace/EBANKING/output_jar_file/firebaseService.jar "%OUTPUT_DIR%"

@REM echo Copying AIService.jar...
@REM docker cp jenkins:/var/jenkins_home/workspace/EBANKING/output_jar_file/AIService.jar "%OUTPUT_DIR%"

if errorlevel 1 (
    echo Failed to copy one or more files from Docker container.
) else (
    echo All files copied successfully.
)

endlocal
pause
