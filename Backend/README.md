# Auth Backend

Node.js and Express backend with TypeScript, Sequelize ORM, and PostgreSQL database for authentication.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (Supabase)
- TypeScript (v5.3.3 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory with your database credentials:
```env
PORT=3000
DB_HOST=db.wvgssejywofnhokqslev.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=@Veer.idk
NODE_ENV=development

# Email Configuration (see EMAIL_SETUP.md for details)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Auth System
FRONTEND_URL=http://localhost:4200
```

3. Run database migration:
```bash
npm run migrate
```

## Running the Server

### Development mode (with auto-reload using tsx):
```bash
npm run dev
```

### Production mode:
Build TypeScript first, then start:
```bash
npm run build
npm start
```

### Type checking:
```bash
npm run type-check
```

## Database Schema

The `users` table includes the following fields (defined in Sequelize model):

- `uuid` - Primary key (UUID, auto-generated)
- `username` - Unique username (VARCHAR 255)
- `email` - Unique email address (VARCHAR 255, validated)
- `password` - Hashed password (VARCHAR 255)
- `otp` - One-time password (VARCHAR 6, nullable)
- `firstname` - User's first name (VARCHAR 255, nullable)
- `lastname` - User's last name (VARCHAR 255, nullable)
- `role` - User role (VARCHAR 50, default: 'user')
- `country_code` - Phone country code (VARCHAR 10, nullable)
- `phone_number` - Phone number (VARCHAR 20, nullable)
- `reset_token_hash` - Password reset token hash (VARCHAR 255, nullable)
- `reset_token_expires_at` - Reset token expiration (TIMESTAMP, nullable)
- `login_attempts` - Failed login attempts counter (INTEGER, default: 0)
- `last_login` - Last login timestamp (TIMESTAMP, nullable)
- `status` - Account status (VARCHAR 50, default: 'active')
- `google_id` - Google OAuth ID (VARCHAR 255, unique, nullable)
- `meta_id` - Meta/Facebook OAuth ID (VARCHAR 255, unique, nullable)
- `verified` - Email verification status (BOOLEAN, default: false)
- `created_at` - Account creation timestamp (auto-managed)
- `updated_at` - Last update timestamp (auto-managed)

## API Endpoints

### Health Check
- `GET /health` - Check server and database connection status

## Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   └── database.ts      # Sequelize database configuration
│   ├── models/
│   │   ├── User.ts          # User Sequelize model
│   │   └── index.ts         # Models index file
│   ├── scripts/
│   │   └── migrate.ts       # Database migration script
│   └── index.ts             # Main server file (Express)
├── dist/                    # Compiled JavaScript (generated)
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── .env                     # Environment variables (not in git)
└── README.md                # This file
```

## Technologies Used

- **Express** - Web framework
- **Sequelize** - ORM for PostgreSQL
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Database (via Supabase)
- **Nodemailer** - Email service for sending OTP and password reset emails
- **tsx** - TypeScript execution engine for development

## Email Service

The backend uses **Nodemailer** for sending emails. See [EMAIL_SETUP.md](./EMAIL_SETUP.md) for detailed setup instructions.

**Supported Providers:**
- Gmail (recommended for development)
- Generic SMTP (works with most providers)
- SendGrid
- Mailgun
- AWS SES

**Email Features:**
- OTP verification emails
- Password reset emails
- Welcome emails
- HTML email templates
- Automatic email service verification on startup

