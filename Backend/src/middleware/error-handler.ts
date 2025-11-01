import { Request, Response, NextFunction } from 'express';
import { sendError, sendInternalError } from '../utils/response';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging
  console.error('Error:', {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    url: req.url,
    method: req.method,
  });

  // Handle Sequelize validation errors
  if (error.name === 'SequelizeValidationError') {
    const errors: Record<string, string[]> = {};
    (error as any).errors.forEach((err: any) => {
      if (!errors[err.path]) {
        errors[err.path] = [];
      }
      errors[err.path].push(err.message);
    });
    sendError(res, 'Validation failed', 400, error.message, errors);
    return;
  }

  // Handle Sequelize unique constraint errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    sendError(res, 'Duplicate entry', 409, 'Resource already exists');
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401);
    return;
  }

  // Default to internal server error
  sendInternalError(res);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.path} not found`, 404);
};

