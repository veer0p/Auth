import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { sendUnauthorized, sendError } from '../utils/response';
import User from '../models/User';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      currentUser?: User;
    }
  }
}

/**
 * Middleware to verify JWT access token and attach user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res, 'No token provided or invalid format');
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyAccessToken(token);

    // Get user from database to ensure they still exist and are active
    // Load all fields as they may be needed by controllers
    const user = await User.findOne({
      where: {
        uuid: payload.uuid,
        status: 'active',
      },
    });

    if (!user) {
      sendUnauthorized(res, 'User not found or inactive');
      return;
    }

    // Attach user info to request
    req.user = payload;
    req.currentUser = user;

    next();
  } catch (error: any) {
    if (error.message.includes('expired')) {
      sendUnauthorized(res, 'Token has expired');
    } else if (error.message.includes('Invalid')) {
      sendUnauthorized(res, 'Invalid token');
    } else {
      sendError(res, 'Authentication failed', 401, error.message);
    }
  }
};

/**
 * Middleware to check if user has specific role
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is verified
 */
export const requireVerified = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.currentUser) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }

  if (!req.currentUser.verified) {
    sendError(res, 'Email not verified', 403, 'Please verify your email address');
    return;
  }

  next();
};

