import { sanitizeInput, validateEmail, validatePhone } from './security';

// Validation rules for different input types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Form validation schemas
export const authValidationSchema = {
  email: {
    required: true,
    maxLength: 255,
    custom: (value: string) => {
      if (!validateEmail(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    }
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    custom: (value: string) => {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
      return null;
    }
  },
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-\.]+$/,
    custom: (value: string) => {
      // Allow common name characters including periods, hyphens, apostrophes, and spaces
      const trimmed = value.trim();
      if (trimmed.length < 2) {
        return 'Name must be at least 2 characters long';
      }
      if (!/^[a-zA-Z\s'-\.]+$/.test(trimmed)) {
        return 'Name can only contain letters, spaces, hyphens, apostrophes, and periods';
      }
      return null;
    }
  },
  phone: {
    required: true,
    custom: (value: string) => {
      if (!validatePhone(value)) {
        return 'Please enter a valid 10-digit Indian phone number';
      }
      return null;
    }
  },
  phone_number: {
    required: true,
    custom: (value: string) => {
      if (!validatePhone(value)) {
        return 'Please enter a valid 10-digit Indian phone number';
      }
      return null;
    }
  },
  registrantPhone: {
    required: true,
    custom: (value: string) => {
      if (!validatePhone(value)) {
        return 'Please enter a valid 10-digit Indian phone number';
      }
      return null;
    }
  },
  partnerId: {
    required: false,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/
  }
} as const;

// Generic validation function
export const validateField = (value: unknown, rules: ValidationRule): string | null => {
  // Required check
  if (rules.required && (!value || value.toString().trim() === '')) {
    return 'This field is required';
  }

  // Skip other validations if value is empty and not required
  if (!value || value.toString().trim() === '') {
    return null;
  }

  const stringValue = value.toString();

  // Length checks
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters long`;
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters long`;
  }

  // Pattern check
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return 'Invalid format';
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      return customError;
    }
  }

  return null;
};

// Validate entire form
export const validateForm = (
  formData: Record<string, unknown>,
  schema: Record<string, ValidationRule>
): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.entries(schema).forEach(([field, rules]) => {
    const error = validateField(formData[field], rules);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Real-time validation for forms
export const createFieldValidator = (schema: Record<string, ValidationRule>) => {
  return (field: string, value: unknown): string | null => {
    const rules = schema[field];
    if (!rules) return null;
    return validateField(value, rules);
  };
};

// Password strength checker
export const getPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[^a-zA-Z\d]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  if (password.length >= 12) score += 1;

  return { score, feedback };
};

// Sanitize form data before submission
export const sanitizeFormData = (formData: Record<string, unknown>): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  Object.entries(formData).forEach(([key, value]) => {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
};
