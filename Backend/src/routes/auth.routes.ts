import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as socialAuthController from '../controllers/social-auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Sign up
router.post(
  '/signup',
  validate([
    { field: 'username', required: true, minLength: 3, maxLength: 50 },
    { field: 'email', required: true, isEmail: true },
    { field: 'password', required: true, isStrongPassword: true },
    { field: 'firstname', maxLength: 100 },
    { field: 'lastname', maxLength: 100 },
    { field: 'country_code', maxLength: 10 },
    { field: 'phone_number', maxLength: 20 },
  ]),
  authController.signup
);

// Sign in
router.post(
  '/signin',
  validate([
    { field: 'email', required: true, isEmail: true },
    { field: 'password', required: true },
  ]),
  authController.signin
);

// Refresh token
router.post(
  '/refresh',
  validate([{ field: 'refreshToken', required: true }]),
  authController.refreshToken
);

// Forgot password
router.post(
  '/forgot-password',
  validate([{ field: 'email', required: true, isEmail: true }]),
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  validate([
    { field: 'resetToken', required: true },
    { field: 'newPassword', required: true, isStrongPassword: true },
  ]),
  authController.resetPassword
);

// Social authentication - Google
router.post(
  '/google',
  validate([
    { field: 'google_id', required: true },
    { field: 'email', required: true, isEmail: true },
  ]),
  socialAuthController.googleAuth
);

// Social authentication - Meta/Facebook
router.post(
  '/meta',
  validate([
    { field: 'meta_id', required: true },
    { field: 'email', required: true, isEmail: true },
  ]),
  socialAuthController.metaAuth
);

// Get profile (protected route)
router.get('/profile', authenticate, authController.getProfile);

// Logout (protected route)
router.post('/logout', authenticate, authController.logout);

export default router;

