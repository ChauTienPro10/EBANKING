#!/bin/bash

# Advanced Test script for Transaction Request API
BASE_URL="http://3.85.17.154:7999"

echo "=== Testing Advanced Transaction Request API ==="
echo

# Step 1: Login to get JWT token
echo "1. Getting JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin@123"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract token (assuming the response has a "token" field)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get JWT token. Please check login credentials."
    exit 1
fi

echo "✅ JWT token obtained: ${TOKEN:0:20}..."
echo

# Step 2: Test basic pagination
echo "2. Testing GET /api/transaction-requests (basic pagination - page 0, size 10)..."
curl -s -X GET "$BASE_URL/api/transaction-requests?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo

# Step 3: Test date range filter
echo "3. Testing date range filter (December 2024)..."
curl -s -X GET "$BASE_URL/api/transaction-requests?fromDate=2024-12-01&toDate=2024-12-31&page=0&size=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo

# Step 4: Test status filter
echo "4. Testing status filter (COMPLETED)..."
curl -s -X GET "$BASE_URL/api/transaction-requests?status=COMPLETED&page=0&size=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo

# Step 5: Test amount range filter
echo "5. Testing amount range filter (100,000 - 5,000,000)..."
curl -s -X GET "$BASE_URL/api/transaction-requests?minAmount=100000&maxAmount=5000000&page=0&size=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo

# Step 6: Test reference number filter
echo "6. Testing reference number filter (TXN)..."
curl -s -X GET "$BASE_URL/api/transaction-requests?referenceNumber=TXN&page=0&size=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo

# Step 7: Test sorting
echo "7. Testing sorting (by amount ASC)..."
curl -s -X GET "$BASE_URL/api/transaction-requests?sortBy=amount&sortDirection=ASC&page=0&size=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo

# Step 8: Test combined filters
echo "8. Testing combined filters (COMPLETED + date range + amount range)..."
curl -s -X GET "$BASE_URL/api/transaction-requests?status=COMPLETED&fromDate=2024-12-01&minAmount=100000&sortBy=amount&sortDirection=ASC&page=0&size=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo

# Step 9: Test transaction type filter
echo "9. Testing transaction type filter (TRANSFER)..."
curl -s -X GET "$BASE_URL/api/transaction-requests?transactionType=TRANSFER&page=0&size=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo

# Step 10: Test legacy endpoint
echo "10. Testing legacy endpoint..."
curl -s -X GET "$BASE_URL/api/transaction-requests/legacy?size=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo

# Step 11: Test get specific transaction request (assuming ID 1 exists)
echo "11. Testing GET /api/transaction-requests/1..."
curl -s -X GET "$BASE_URL/api/transaction-requests/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo

echo "=== Advanced Test completed ==="