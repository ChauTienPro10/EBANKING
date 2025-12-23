@echo off
setlocal enabledelayedexpansion

REM Test script for Transaction Request API (Windows)
set BASE_URL=http://localhost:7999

echo === Testing Transaction Request API ===
echo.

REM Step 1: Login to get JWT token
echo 1. Getting JWT token...
curl -s -X POST "%BASE_URL%/api/admin/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin@123\"}" > login_response.json

type login_response.json
echo.

REM Note: For Windows batch, token extraction is more complex
REM You may need to manually copy the token from login_response.json
echo Please copy the token from login_response.json and set it manually:
echo set TOKEN=your_token_here
echo.

REM Step 2: Test get transaction requests (you need to set TOKEN manually)
echo 2. Testing GET /api/transaction-requests (default size=20)...
echo Please run this command with your token:
echo curl -X GET "%BASE_URL%/api/transaction-requests" -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json"
echo.

echo 3. Testing GET /api/transaction-requests?size=5...
echo curl -X GET "%BASE_URL%/api/transaction-requests?size=5" -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json"
echo.

echo 4. Testing GET /api/transaction-requests/1...
echo curl -X GET "%BASE_URL%/api/transaction-requests/1" -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json"
echo.

echo === Test completed ===
echo Note: Replace YOUR_TOKEN with the actual token from login_response.json

REM Clean up
del login_response.json 2>nul