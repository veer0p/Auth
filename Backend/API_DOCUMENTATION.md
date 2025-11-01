# Authentication API Documentation

Base URL: `http://localhost:3000/api/auth`

All endpoints return JSON responses with the following structure:
- Success: `{ "success": true, "message": "...", "data": {...} }`
- Error: `{ "success": false, "message": "...", "error": "...", "errors": {...} }`

## Table of Contents
1. [Sign Up](#sign-up)
2. [Sign In](#sign-in)
3. [Refresh Token](#refresh-token)
4. [Forgot Password](#forgot-password)
5. [Reset Password](#reset-password)
6. [Get Profile](#get-profile)
7. [Logout](#logout)
8. [Google OAuth](#google-oauth)
9. [Meta/Facebook OAuth](#metafacebook-oauth)

---

## Sign Up

Create a new user account.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstname": "John",
  "lastname": "Doe",
  "country_code": "+1",
  "phone_number": "1234567890"
}
```

**Required Fields:**
- `username` (min 3, max 50 characters)
- `email` (valid email format)
- `password` (min 8 chars, must contain uppercase, lowercase, number, special char)

**Optional Fields:**
- `firstname`
- `lastname`
- `country_code`
- `phone_number`

**cURL Command:**
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

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully. Please verify your email.",
  "data": {
    "user": {
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "username": "johndoe",
      "email": "john@example.com",
      "firstname": "John",
      "lastname": "Doe",
      "role": "user",
      "verified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "otp": "123456"
  }
}
```

---

## Sign In

Authenticate user and get access tokens.

**Endpoint:** `POST /api/auth/signin`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "username": "johndoe",
      "email": "john@example.com",
      "firstname": "John",
      "lastname": "Doe",
      "role": "user",
      "verified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Refresh Token

Get a new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Forgot Password

Request password reset token (sends email in production).

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent",
  "data": {
    "resetToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    "message": "Use this token to reset your password. In production, check your email."
  }
}
```

---

## Reset Password

Reset password using reset token.

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "resetToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "newPassword": "NewSecurePass123!"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "resetToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    "newPassword": "NewSecurePass123!"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Get Profile

Get current authenticated user's profile.

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "username": "johndoe",
    "email": "john@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "role": "user",
    "verified": false,
    "country_code": "+1",
    "phone_number": "1234567890",
    "last_login": "2024-01-01T12:00:00.000Z",
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

---

## Logout

Invalidate refresh token (logout).

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Google OAuth

Sign in/Sign up with Google account.

**Endpoint:** `POST /api/auth/google`

**Request Body:**
```json
{
  "google_id": "1234567890",
  "email": "john@gmail.com",
  "name": "John Doe",
  "firstname": "John",
  "lastname": "Doe",
  "picture": "https://..."
}
```

**Required Fields:**
- `google_id`
- `email`

**Optional Fields:**
- `name`
- `firstname`
- `lastname`
- `picture`

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "google_id": "1234567890",
    "email": "john@gmail.com",
    "name": "John Doe"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": {
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "username": "john_gmail_com_123456",
      "email": "john@gmail.com",
      "firstname": "John",
      "lastname": "Doe",
      "role": "user",
      "verified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Meta/Facebook OAuth

Sign in/Sign up with Meta/Facebook account.

**Endpoint:** `POST /api/auth/meta`

**Request Body:**
```json
{
  "meta_id": "1234567890",
  "email": "john@facebook.com",
  "name": "John Doe",
  "firstname": "John",
  "lastname": "Doe",
  "picture": "https://..."
}
```

**Required Fields:**
- `meta_id`
- `email`

**Optional Fields:**
- `name`
- `firstname`
- `lastname`
- `picture`

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/auth/meta \
  -H "Content-Type: application/json" \
  -d '{
    "meta_id": "1234567890",
    "email": "john@facebook.com",
    "name": "John Doe"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Meta authentication successful",
  "data": {
    "user": {
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "username": "john_facebook_com_123456",
      "email": "john@facebook.com",
      "firstname": "John",
      "lastname": "Doe",
      "role": "user",
      "verified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["email must be a valid email address"],
    "password": ["password must be at least 8 characters long"]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Email not verified",
  "error": "Please verify your email address"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "User already exists",
  "error": "Email or username already registered"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Account locked due to too many failed login attempts. Try again in 15 minutes."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Complete Workflow Examples

### 1. Sign Up → Sign In → Get Profile
```bash
# 1. Sign Up
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }')

# Extract tokens (requires jq)
ACCESS_TOKEN=$(echo $SIGNUP_RESPONSE | jq -r '.data.accessToken')

# 2. Get Profile
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### 2. Sign In → Refresh Token
```bash
# 1. Sign In
SIGNIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }')

REFRESH_TOKEN=$(echo $SIGNIN_RESPONSE | jq -r '.data.refreshToken')

# 2. Refresh Token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }"
```

### 3. Forgot Password → Reset Password
```bash
# 1. Forgot Password
FORGOT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }')

RESET_TOKEN=$(echo $FORGOT_RESPONSE | jq -r '.data.resetToken')

# 2. Reset Password
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d "{
    \"resetToken\": \"$RESET_TOKEN\",
    \"newPassword\": \"NewSecurePass123!\"
  }"
```

---

## Security Notes

1. **JWT Tokens:**
   - Access tokens expire in 15 minutes (configurable)
   - Refresh tokens expire in 7 days (configurable)
   - Always use HTTPS in production

2. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

3. **Rate Limiting:**
   - Account locks after 5 failed login attempts
   - 15-minute lockout period

4. **Token Storage:**
   - Store refresh tokens securely (httpOnly cookies recommended)
   - Never expose refresh tokens in client-side code

5. **Production Checklist:**
   - Change JWT secrets in `.env`
   - Use strong, randomly generated secrets (min 32 characters)
   - Enable HTTPS
   - Set up email service for OTP and password reset
   - Implement rate limiting middleware
   - Use environment-specific database credentials
   - Enable CORS for specific origins only

