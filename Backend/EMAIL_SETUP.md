# Email Service Setup Guide

The backend uses **Nodemailer** for sending emails. It supports multiple email providers including Gmail, SendGrid, Mailgun, and generic SMTP.

## Email Providers Supported

### 1. Gmail (Recommended for Development)

**Setup Steps:**
1. Enable 2-Step Verification on your Gmail account
2. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password

**Environment Variables:**
```env
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Auth System
FRONTEND_URL=http://localhost:4200
```

### 2. Generic SMTP (Works with most providers)

**Environment Variables:**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com          # or smtp.yourprovider.com
SMTP_PORT=587                      # 587 for TLS, 465 for SSL, 25 for plain
SMTP_SECURE=false                  # true for 465, false for 587/25
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
EMAIL_FROM=your-email@example.com
EMAIL_FROM_NAME=Auth System
FRONTEND_URL=http://localhost:4200
```

### 3. SendGrid

**Setup:**
1. Create account at https://sendgrid.com
2. Create API Key with "Mail Send" permissions
3. Verify sender email

**Environment Variables:**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=verified-email@yourdomain.com
EMAIL_FROM_NAME=Auth System
FRONTEND_URL=http://localhost:4200
```

### 4. Mailgun

**Setup:**
1. Create account at https://mailgun.com
2. Get SMTP credentials from dashboard

**Environment Variables:**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Auth System
FRONTEND_URL=http://localhost:4200
```

### 5. AWS SES

**Setup:**
1. Verify email/domain in AWS SES
2. Get SMTP credentials from AWS Console

**Environment Variables:**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=email-smtp.region.amazonaws.com  # e.g., email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-aws-smtp-username
SMTP_PASSWORD=your-aws-smtp-password
EMAIL_FROM=verified-email@yourdomain.com
EMAIL_FROM_NAME=Auth System
FRONTEND_URL=http://localhost:4200
```

## Email Templates

The system includes pre-built HTML email templates for:

1. **OTP Verification** - 6-digit OTP for email verification
2. **Password Reset** - Reset link with token
3. **Welcome Email** - Welcome message for new users

All templates are responsive and include fallback plain text versions.

## Testing Email Service

The email service is automatically verified on server startup. You'll see:
- ✓ Email service is ready to send emails (if configured correctly)
- ⚠ Email service not configured (if credentials missing)

## Email Features

### Automatic Email Sending
- **Sign Up**: Sends OTP email + Welcome email
- **Forgot Password**: Sends password reset link via email
- **Development Mode**: Returns OTP/tokens in response for testing
- **Production Mode**: Only sends via email (secure)

### Security
- OTP and reset tokens are NEVER returned in production responses
- Email verification prevents spam signups
- Reset tokens expire in 1 hour
- OTP expires in 10 minutes (configurable)

## Troubleshooting

### Email not sending
1. Check credentials in `.env`
2. Verify email service connection on startup
3. Check spam folder
4. For Gmail: Ensure App Password is used (not regular password)
5. For SMTP: Check firewall/port blocking

### Common Errors

**Error: "Invalid login"**
- Wrong password or App Password needed for Gmail
- Check SMTP credentials

**Error: "Connection timeout"**
- Check SMTP_PORT (587, 465, or 25)
- Check firewall settings
- Try different port

**Error: "Self-signed certificate"**
- Set `SMTP_SECURE=false` for TLS (port 587)
- Or configure SSL properly (port 465)

## Production Recommendations

1. **Use Dedicated Email Service**: SendGrid, Mailgun, or AWS SES for production
2. **Verify Domain**: Set up SPF, DKIM, and DMARC records
3. **Monitor Delivery**: Track email delivery rates
4. **Rate Limiting**: Implement rate limiting on email endpoints
5. **Queue System**: Use email queue (Bull, RabbitMQ) for high volume

## Example .env Configuration

```env
# Email Configuration
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Auth System

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:4200

# Environment
NODE_ENV=development  # or production
```


