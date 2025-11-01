import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  TokenPayload,
} from '../utils/jwt';
import {
  sendSuccess,
  sendError,
  sendInternalError,
} from '../utils/response';

const BCRYPT_ROUNDS = 12;

/**
 * Google OAuth sign in/sign up
 */
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { google_id, email, name, firstname, lastname } = req.body;

    if (!google_id || !email) {
      sendError(res, 'Google ID and email are required', 400);
      return;
    }

    // Find user by google_id first, then by email
    let user = await User.findOne({
      where: { google_id },
    });

    if (!user) {
      // If not found by google_id, check by email
      user = await User.findOne({
        where: { email },
      });

      if (user) {
        // User exists with email but no google_id - check if they have other OAuth
        if (user.meta_id) {
          sendError(res, 'Email is already registered with another provider', 409);
          return;
        }
        // Update user with google_id
        await user.update({ google_id });
      }
    }

    if (!user) {
      // New user - create account
      // Generate a random password (user won't use it for OAuth login)
      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!';
      const hashedPassword = await bcrypt.hash(randomPassword, BCRYPT_ROUNDS);

      // Generate unique username from email with timestamp and random suffix
      const baseUsername = email.split('@')[0];
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      let username = `${baseUsername}_${timestamp}_${randomSuffix}`;
      
      // Check if username already exists (very unlikely but handle it)
      let existingUsername = await User.findOne({ where: { username } });
      let attempts = 0;
      while (existingUsername && attempts < 5) {
        username = `${baseUsername}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
        existingUsername = await User.findOne({ where: { username } });
        attempts++;
      }

      // If still exists after retries, use UUID as fallback
      if (existingUsername) {
        username = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      }

      user = await User.create({
        google_id,
        email,
        username,
        password: hashedPassword,
        firstname: firstname || name?.split(' ')[0] || null,
        lastname: lastname || name?.split(' ').slice(1).join(' ') || null,
        role: 'user',
        status: 'active',
        verified: true, // Google email is already verified
        login_attempts: 0,
      });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate tokens
    const payload: TokenPayload = {
      uuid: user.uuid,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Hash and store refresh token
    const refreshTokenHash = hashToken(refreshToken);
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 days

    await user.update({
      refresh_token_hash: refreshTokenHash,
      refresh_token_expires_at: refreshTokenExpires,
    });

    // Remove sensitive data from response
    const userResponse = {
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      verified: user.verified,
    };

    sendSuccess(res, 'Google authentication successful', {
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    sendInternalError(res, 'Failed to authenticate with Google');
  }
};

/**
 * Meta/Facebook OAuth sign in/sign up
 */
export const metaAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { meta_id, email, name, firstname, lastname } = req.body;

    if (!meta_id || !email) {
      sendError(res, 'Meta ID and email are required', 400);
      return;
    }

    // Find user by meta_id first, then by email
    let user = await User.findOne({
      where: { meta_id },
    });

    if (!user) {
      // If not found by meta_id, check by email
      user = await User.findOne({
        where: { email },
      });

      if (user) {
        // User exists with email but no meta_id - check if they have other OAuth
        if (user.google_id) {
          sendError(res, 'Email is already registered with another provider', 409);
          return;
        }
        // Update user with meta_id
        await user.update({ meta_id });
      }
    }

    if (!user) {
      // New user - create account
      // Generate a random password (user won't use it for OAuth login)
      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!';
      const hashedPassword = await bcrypt.hash(randomPassword, BCRYPT_ROUNDS);

      // Generate unique username from email with timestamp and random suffix
      const baseUsername = email.split('@')[0];
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      let username = `${baseUsername}_${timestamp}_${randomSuffix}`;
      
      // Check if username already exists (very unlikely but handle it)
      let existingUsername = await User.findOne({ where: { username } });
      let attempts = 0;
      while (existingUsername && attempts < 5) {
        username = `${baseUsername}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
        existingUsername = await User.findOne({ where: { username } });
        attempts++;
      }

      // If still exists after retries, use UUID as fallback
      if (existingUsername) {
        username = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      }

      user = await User.create({
        meta_id,
        email,
        username,
        password: hashedPassword,
        firstname: firstname || name?.split(' ')[0] || null,
        lastname: lastname || name?.split(' ').slice(1).join(' ') || null,
        role: 'user',
        status: 'active',
        verified: true, // Meta email is already verified
        login_attempts: 0,
      });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate tokens
    const payload: TokenPayload = {
      uuid: user.uuid,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Hash and store refresh token
    const refreshTokenHash = hashToken(refreshToken);
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 days

    await user.update({
      refresh_token_hash: refreshTokenHash,
      refresh_token_expires_at: refreshTokenExpires,
    });

    // Remove sensitive data from response
    const userResponse = {
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      verified: user.verified,
    };

    sendSuccess(res, 'Meta authentication successful', {
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error('Meta auth error:', error);
    sendInternalError(res, 'Failed to authenticate with Meta');
  }
};

