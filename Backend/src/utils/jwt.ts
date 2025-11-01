import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Validate JWT secrets are set
if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  console.warn('⚠ WARNING: JWT_SECRET not set or using default value. Set it in .env for production!');
}

if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET === 'your-refresh-secret-key-change-in-production') {
  console.warn('⚠ WARNING: JWT_REFRESH_SECRET not set or using default value. Set it in .env for production!');
}

// Use defaults only in development
// In production, these must be set, but we allow defaults in development for easier setup
const defaultSecret = 'dev-secret-key-change-in-production-min-32-chars-required-for-security';
const defaultRefreshSecret = 'dev-refresh-secret-key-change-in-production-min-32-chars-required-for-security';

// Ensure we always have a non-empty string for JWT secrets
const secretKey: string = JWT_SECRET || defaultSecret;
const refreshSecretKey: string = JWT_REFRESH_SECRET || defaultRefreshSecret;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables for production');
  }
  // In development, allow defaults but warn
  console.warn('⚠ Using default JWT secrets. Set JWT_SECRET and JWT_REFRESH_SECRET in .env for security.');
}

export interface TokenPayload {
  uuid: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload extends TokenPayload {
  tokenVersion?: number;
}

/**
 * Generate access token (short-lived)
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(
    payload,
    secretKey,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'auth-backend',
      audience: 'auth-frontend',
    } as SignOptions
  );
};

/**
 * Generate refresh token (long-lived)
 */
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(
    payload,
    refreshSecretKey,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'auth-backend',
      audience: 'auth-frontend',
    } as SignOptions
  );
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, secretKey, {
      issuer: 'auth-backend',
      audience: 'auth-frontend',
    }) as TokenPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    } else {
      throw new Error('Invalid or expired access token');
    }
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, refreshSecretKey, {
      issuer: 'auth-backend',
      audience: 'auth-frontend',
    }) as RefreshTokenPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Invalid or expired refresh token');
    }
  }
};

/**
 * Generate password reset token (random string, not JWT)
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash token (for storing in database)
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate OTP (6 digits)
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

