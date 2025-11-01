#!/bin/bash

# Generate unique username
UNIQUE_ID=$(date +%s)
USERNAME="testuser${UNIQUE_ID}"
EMAIL="testuser${UNIQUE_ID}@example.com"
PASSWORD="TestPass123!"

echo "========================================"
echo "Testing All Backend APIs"
echo "Using: $EMAIL / $USERNAME"
echo "========================================"
echo ""

ACCESS_TOKEN=""
REFRESH_TOKEN=""

# Test 1: Sign Up
echo "1. Testing Sign Up API..."
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstname\": \"Test\",
    \"lastname\": \"User\"
  }")

SIGNUP_SUCCESS=$(echo "$SIGNUP_RESPONSE" | jq -r '.success' 2>/dev/null)

if [ "$SIGNUP_SUCCESS" = "true" ]; then
  echo "✓ Sign Up Successful"
  ACCESS_TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.data.accessToken' 2>/dev/null)
  REFRESH_TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.data.refreshToken' 2>/dev/null)
  USER_UUID=$(echo "$SIGNUP_RESPONSE" | jq -r '.data.user.uuid' 2>/dev/null)
  echo "  User UUID: $USER_UUID"
  echo "  Access Token: ${ACCESS_TOKEN:0:30}..."
else
  echo "✗ Sign Up Failed"
  echo "$SIGNUP_RESPONSE" | jq . 2>/dev/null || echo "$SIGNUP_RESPONSE"
  exit 1
fi
echo ""

# Test 2: Sign In
echo "2. Testing Sign In API..."
SIGNIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

SIGNIN_SUCCESS=$(echo "$SIGNIN_RESPONSE" | jq -r '.success' 2>/dev/null)

if [ "$SIGNIN_SUCCESS" = "true" ]; then
  echo "✓ Sign In Successful"
  ACCESS_TOKEN=$(echo "$SIGNIN_RESPONSE" | jq -r '.data.accessToken' 2>/dev/null)
  REFRESH_TOKEN=$(echo "$SIGNIN_RESPONSE" | jq -r '.data.refreshToken' 2>/dev/null)
  USER_EMAIL=$(echo "$SIGNIN_RESPONSE" | jq -r '.data.user.email' 2>/dev/null)
  echo "  User Email: $USER_EMAIL"
else
  echo "✗ Sign In Failed"
  echo "$SIGNIN_RESPONSE" | jq . 2>/dev/null || echo "$SIGNIN_RESPONSE"
  exit 1
fi
echo ""

# Test 3: Get Profile
echo "3. Testing Get Profile API..."
PROFILE_RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN")

PROFILE_SUCCESS=$(echo "$PROFILE_RESPONSE" | jq -r '.success' 2>/dev/null)

if [ "$PROFILE_SUCCESS" = "true" ]; then
  echo "✓ Get Profile Successful"
  USERNAME_PROFILE=$(echo "$PROFILE_RESPONSE" | jq -r '.data.username' 2>/dev/null)
  EMAIL_PROFILE=$(echo "$PROFILE_RESPONSE" | jq -r '.data.email' 2>/dev/null)
  ROLE_PROFILE=$(echo "$PROFILE_RESPONSE" | jq -r '.data.role' 2>/dev/null)
  echo "  Username: $USERNAME_PROFILE"
  echo "  Email: $EMAIL_PROFILE"
  echo "  Role: $ROLE_PROFILE"
else
  echo "✗ Get Profile Failed"
  echo "$PROFILE_RESPONSE" | jq . 2>/dev/null || echo "$PROFILE_RESPONSE"
  exit 1
fi
echo ""

# Test 4: Refresh Token
echo "4. Testing Refresh Token API..."
REFRESH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

REFRESH_SUCCESS=$(echo "$REFRESH_RESPONSE" | jq -r '.success' 2>/dev/null)

if [ "$REFRESH_SUCCESS" = "true" ]; then
  echo "✓ Refresh Token Successful"
  NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.data.accessToken' 2>/dev/null)
  NEW_REFRESH_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.data.refreshToken' 2>/dev/null)
  ACCESS_TOKEN=$NEW_ACCESS_TOKEN
  REFRESH_TOKEN=$NEW_REFRESH_TOKEN
  echo "  New tokens generated"
else
  echo "✗ Refresh Token Failed"
  echo "$REFRESH_RESPONSE" | jq . 2>/dev/null || echo "$REFRESH_RESPONSE"
  exit 1
fi
echo ""

# Test 5: Get Profile with New Token
echo "5. Testing Get Profile with Refreshed Token..."
PROFILE_RESPONSE2=$(curl -s -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN")

PROFILE_SUCCESS2=$(echo "$PROFILE_RESPONSE2" | jq -r '.success' 2>/dev/null)

if [ "$PROFILE_SUCCESS2" = "true" ]; then
  echo "✓ Get Profile with New Token Successful"
else
  echo "✗ Get Profile with New Token Failed"
  echo "$PROFILE_RESPONSE2" | jq . 2>/dev/null || echo "$PROFILE_RESPONSE2"
  exit 1
fi
echo ""

# Test 6: Forgot Password
echo "6. Testing Forgot Password API..."
FORGOT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\"}")

FORGOT_SUCCESS=$(echo "$FORGOT_RESPONSE" | jq -r '.success' 2>/dev/null)

if [ "$FORGOT_SUCCESS" = "true" ]; then
  echo "✓ Forgot Password Successful"
  echo "  (Reset token sent to email)"
else
  echo "⚠ Forgot Password - check email service setup"
  echo "$FORGOT_RESPONSE" | jq . 2>/dev/null || echo "$FORGOT_RESPONSE"
fi
echo ""

# Test 7: Logout
echo "7. Testing Logout API..."
LOGOUT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json")

LOGOUT_SUCCESS=$(echo "$LOGOUT_RESPONSE" | jq -r '.success' 2>/dev/null)

if [ "$LOGOUT_SUCCESS" = "true" ]; then
  echo "✓ Logout Successful"
else
  echo "✗ Logout Failed"
  echo "$LOGOUT_RESPONSE" | jq . 2>/dev/null || echo "$LOGOUT_RESPONSE"
  exit 1
fi
echo ""

# Test 8: Try accessing protected route after logout
echo "8. Testing Protected Route After Logout..."
PROFILE_AFTER_LOGOUT=$(curl -s -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN")

PROFILE_ERROR=$(echo "$PROFILE_AFTER_LOGOUT" | jq -r '.success' 2>/dev/null)

if [ "$PROFILE_ERROR" = "false" ]; then
  echo "✓ Protected Route Correctly Rejected After Logout (Expected)"
  ERROR_MSG=$(echo "$PROFILE_AFTER_LOGOUT" | jq -r '.message' 2>/dev/null)
  echo "  Error: $ERROR_MSG"
else
  echo "✗ Protected Route Should Have Been Rejected"
  echo "$PROFILE_AFTER_LOGOUT" | jq . 2>/dev/null || echo "$PROFILE_AFTER_LOGOUT"
  exit 1
fi
echo ""

echo "========================================"
echo "✅ All API Tests Passed!"
echo "========================================"
