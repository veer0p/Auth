import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  hashToken,
  generateOTP,
  TokenPayload,
} from '../utils/jwt';
import {
  sendSuccess,
  sendError,
  sendUnauthorized,
  sendNotFound,
  sendInternalError,
} from '../utils/response';
import { emailService } from '../services/email.service';
import { Op } from 'sequelize';

const BCRYPT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

/**
 * Sign up a new user
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, firstname, lastname, country_code, phone_number } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      sendError(res, 'User already exists', 409, 'Email or username already registered');
      return;
    }

    // Validate password strength (additional check)
    if (password.length < 8) {
      sendError(res, 'Password must be at least 8 characters long', 400);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Generate OTP for email verification
    const otp = generateOTP();

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      firstname,
      lastname,
      country_code,
      phone_number,
      otp,
      role: 'user',
      status: 'active',
      verified: false,
      login_attempts: 0,
    });

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

    // Send OTP email for verification
    try {
      await emailService.sendOTPEmail(user.email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Continue even if email fails - user can still use OTP from response in development
    }

    // Send welcome email
    try {
      const userName = user.firstname || user.username || user.email.split('@')[0];
      await emailService.sendWelcomeEmail(user.email, userName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Non-critical, continue
    }

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

    // In development, include OTP in response for testing
    // In production, OTP should only be sent via email
    const responseData: any = {
      user: userResponse,
      accessToken,
      refreshToken,
    };

    if (process.env.NODE_ENV === 'development') {
      responseData.otp = otp; // Only include in development
    }

    sendSuccess(
      res,
      'User created successfully. Please check your email to verify your account.',
      responseData,
      201
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    const errorMessage = error?.message || 'Failed to create user';
    const errorDetails = process.env.NODE_ENV === 'development' ? errorMessage : 'Failed to create user';
    sendError(res, errorDetails, 500);
  }
};

/**
 * Sign in existing user
 */
export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      sendUnauthorized(res, 'Invalid email or password');
      return;
    }

    // Check if account is locked
    if (user.login_attempts >= MAX_LOGIN_ATTEMPTS) {
      if (user.last_login) {
        const lockoutTime = new Date(user.last_login.getTime() + LOCKOUT_TIME);
        if (new Date() < lockoutTime) {
          const remainingMinutes = Math.ceil((lockoutTime.getTime() - Date.now()) / 60000);
          sendError(
            res,
            `Account locked due to too many failed login attempts. Try again in ${remainingMinutes} minutes.`,
            429
          );
          return;
        } else {
          // Reset login attempts after lockout period
          await user.update({ login_attempts: 0 });
        }
      } else {
        // If no last_login but max attempts reached, reset attempts (edge case)
        await user.update({ login_attempts: 0 });
      }
    }

    // Check if account is active
    if (user.status !== 'active') {
      sendError(res, 'Account is inactive', 403);
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempts
      const newAttempts = (user.login_attempts || 0) + 1;
      await user.update({
        login_attempts: newAttempts,
        last_login: new Date(),
      });

      sendUnauthorized(res, 'Invalid email or password');
      return;
    }

    // Reset login attempts on successful login
    await user.update({
      login_attempts: 0,
      last_login: new Date(),
    });

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

    sendSuccess(res, 'Login successful', {
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error('Signin error:', error);
    sendInternalError(res, 'Failed to authenticate user');
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Accept both 'refreshToken' and 'refresh_token' for compatibility
    const refreshToken = req.body.refreshToken || req.body.refresh_token;

    if (!refreshToken) {
      sendError(res, 'Refresh token is required', 400);
      return;
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findOne({
      where: { uuid: payload.uuid },
    });

    if (!user || user.status !== 'active') {
      sendUnauthorized(res, 'Invalid refresh token');
      return;
    }

    // Verify stored refresh token hash
    const refreshTokenHash = hashToken(refreshToken);
    if (user.refresh_token_hash !== refreshTokenHash) {
      sendUnauthorized(res, 'Invalid refresh token');
      return;
    }

    // Check if refresh token has expired (stored expiry)
    if (user.refresh_token_expires_at && user.refresh_token_expires_at < new Date()) {
      sendUnauthorized(res, 'Refresh token has expired');
      return;
    }

    // Generate new access token
    const tokenPayload: TokenPayload = {
      uuid: user.uuid,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    sendSuccess(res, 'Token refreshed successfully', {
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    if (error.message.includes('expired') || error.message.includes('Invalid')) {
      sendUnauthorized(res, error.message);
    } else {
      console.error('Refresh token error:', error);
      sendInternalError(res, 'Failed to refresh token');
    }
  }
};

/**
 * Forgot password - send reset token
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      sendSuccess(res, 'If the email exists, a password reset link has been sent');
      return;
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenHash = hashToken(resetToken);
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // 1 hour expiry

    // Store reset token
    await user.update({
      reset_token_hash: resetTokenHash,
      reset_token_expires_at: resetTokenExpires,
    });

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken);
      sendSuccess(res, 'If the email exists, a password reset link has been sent to your email.');
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // In development, include token in response if email fails
      if (process.env.NODE_ENV === 'development') {
        sendSuccess(res, 'Password reset email failed to send. Use token below for testing.', {
          resetToken,
          error: 'Email service unavailable',
        });
      } else {
        sendError(res, 'Failed to send password reset email. Please try again later.', 500);
      }
    }
  } catch (error: any) {
    console.error('Forgot password error:', error);
    sendInternalError(res, 'Failed to process password reset request');
  }
};

/**
 * Reset password using reset token
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      sendError(res, 'Reset token and new password are required', 400);
      return;
    }

    // Hash the provided token to compare
    const resetTokenHash = hashToken(resetToken);

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        reset_token_hash: resetTokenHash,
        reset_token_expires_at: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      sendError(res, 'Invalid or expired reset token', 400);
      return;
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      sendError(res, 'Password must be at least 8 characters long', 400);
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Update password and clear reset token
    await user.update({
      password: hashedPassword,
      reset_token_hash: null,
      reset_token_expires_at: null,
      login_attempts: 0, // Reset login attempts
      last_login: null, // Reset last login
    });

    sendSuccess(res, 'Password reset successfully');
  } catch (error: any) {
    console.error('Reset password error:', error);
    sendInternalError(res, 'Failed to reset password');
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.uuid) {
      sendUnauthorized(res, 'User not authenticated');
      return;
    }

    // Fetch full user profile from database
    const user = await User.findOne({
      where: { uuid: req.user.uuid },
    });

    if (!user) {
      sendNotFound(res, 'User not found');
      return;
    }

    const userResponse = {
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      verified: user.verified,
      country_code: user.country_code,
      phone_number: user.phone_number,
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    sendSuccess(res, 'Profile retrieved successfully', userResponse);
  } catch (error: any) {
    console.error('Get profile error:', error);
    sendInternalError(res, 'Failed to retrieve profile');
  }
};

/**
 * Logout - invalidate refresh token
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.uuid) {
      sendUnauthorized(res, 'User not authenticated');
      return;
    }

    // Find user and clear refresh token
    const user = await User.findOne({
      where: { uuid: req.user.uuid },
    });

    if (!user) {
      sendNotFound(res, 'User not found');
      return;
    }

    // Clear refresh token
    await user.update({
      refresh_token_hash: null,
      refresh_token_expires_at: null,
    });

    sendSuccess(res, 'Logged out successfully');
  } catch (error: any) {
    console.error('Logout error:', error);
    sendInternalError(res, 'Failed to logout');
  }
};

