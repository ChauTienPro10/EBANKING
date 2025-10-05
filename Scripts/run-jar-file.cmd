@echo off
setlocal

:: Đường dẫn đến file jar
set AUTH_JAR_PATH=..\JarFileOutput\authService.jar

:: Kiểm tra file jar có tồn tại không
if not exist "%AUTH_JAR_PATH%" (
    echo File %AUTH_JAR_PATH% khong ton tai!
    goto end
)

:: Chạy file jar authService
echo Dang chay file jar: %AUTH_JAR_PATH%
java -jar "%AUTH_JAR_PATH%"

:end
endlocal
pause
