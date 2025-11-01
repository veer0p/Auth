import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import validator from 'validator';

export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  isEmail?: boolean;
  isStrongPassword?: boolean;
  custom?: (value: any) => boolean | string;
}

/**
 * Validate request body against rules
 */
export const validate = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string[]> = {};

    for (const rule of rules) {
      const value = req.body[rule.field];
      const fieldErrors: string[] = [];

      // Check required
      if (rule.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(`${rule.field} is required`);
        // If required field is missing, don't validate other rules for this field
        if (fieldErrors.length > 0) {
          errors[rule.field] = fieldErrors;
        }
        continue;
      }

      // Skip other validations if field is empty and not required
      if ((value === undefined || value === null || value === '') && !rule.required) {
        continue;
      }

      // Check min length
      if (rule.minLength && value && value.length < rule.minLength) {
        fieldErrors.push(
          `${rule.field} must be at least ${rule.minLength} characters long`
        );
      }

      // Check max length
      if (rule.maxLength && value && value.length > rule.maxLength) {
        fieldErrors.push(
          `${rule.field} must be at most ${rule.maxLength} characters long`
        );
      }

      // Check email format
      if (rule.isEmail && value && !validator.isEmail(value)) {
        fieldErrors.push(`${rule.field} must be a valid email address`);
      }

      // Check strong password
      if (rule.isStrongPassword && value) {
        if (value.length < 8) {
          fieldErrors.push(`${rule.field} must be at least 8 characters long`);
        }
        if (!/[A-Z]/.test(value)) {
          fieldErrors.push(`${rule.field} must contain at least one uppercase letter`);
        }
        if (!/[a-z]/.test(value)) {
          fieldErrors.push(`${rule.field} must contain at least one lowercase letter`);
        }
        if (!/[0-9]/.test(value)) {
          fieldErrors.push(`${rule.field} must contain at least one number`);
        }
        // More comprehensive special character check
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(value)) {
          fieldErrors.push(`${rule.field} must contain at least one special character`);
        }
      }

      // Custom validation
      if (rule.custom && value) {
        const customResult = rule.custom(value);
        if (customResult !== true) {
          fieldErrors.push(
            typeof customResult === 'string' ? customResult : `${rule.field} is invalid`
          );
        }
      }

      if (fieldErrors.length > 0) {
        errors[rule.field] = fieldErrors;
      }
    }

    if (Object.keys(errors).length > 0) {
      sendError(res, 'Validation failed', 400, undefined, errors);
      return;
    }

    next();
  };
};

