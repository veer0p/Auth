# Quick cURL Examples for Authentication API

Base URL: `http://localhost:3000/api/auth`

## 1. Sign Up

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "firstname": "John",
    "lastname": "Doe"
  }'
```

## 2. Sign In

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

## 3. Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

## 4. Forgot Password

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

## 5. Reset Password

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "resetToken": "YOUR_RESET_TOKEN_HERE",
    "newPassword": "NewSecurePass123!"
  }'
```

## 6. Get Profile (Protected)

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## 7. Logout (Protected)

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

## 8. Google OAuth

```bash
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "google_id": "1234567890",
    "email": "john@gmail.com",
    "name": "John Doe"
  }'
```

## 9. Meta/Facebook OAuth

```bash
curl -X POST http://localhost:3000/api/auth/meta \
  -H "Content-Type: application/json" \
  -d '{
    "meta_id": "1234567890",
    "email": "john@facebook.com",
    "name": "John Doe"
  }'
```

## 10. Health Check

```bash
curl -X GET http://localhost:3000/health
```

---

## Complete Workflow Example

```bash
# Step 1: Sign up
SIGNUP=$(curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }')

# Extract access token (requires jq: sudo apt install jq)
ACCESS_TOKEN=$(echo $SIGNUP | jq -r '.data.accessToken')
REFRESH_TOKEN=$(echo $SIGNUP | jq -r '.data.refreshToken')

echo "Access Token: $ACCESS_TOKEN"
echo "Refresh Token: $REFRESH_TOKEN"

# Step 2: Get profile
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Step 3: Refresh token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }"

# Step 4: Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Using Environment Variables

Save tokens to environment variables for easier testing:

```bash
# Sign in and save tokens
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }')

export ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.data.accessToken')
export REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.data.refreshToken')

# Use tokens
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## Pretty Print JSON Response

Add `| jq .` at the end of any curl command to pretty print:

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
```

