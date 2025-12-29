@echo off
echo Testing Transfer Purpose API...

echo.
echo 1. Testing GET /authService/transfer/purposes (via authService proxy)
curl -X GET "http://3.85.17.154:8081/transfer/purposes" ^
     -H "Content-Type: application/json"

echo.
echo.
echo 2. Testing GET /authService/transfer/purposes (direct transactionService)
curl -X GET "http://3.85.17.154:8082/authService/transfer/purposes" ^
     -H "Content-Type: application/json"

echo.
echo.
echo Test completed!
pause