import { sanitizeErrorMessage } from './security';

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  timestamp: string;
  userMessage: string;
}

// Error codes for different types of errors
export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR'
}

// Create standardized error responses
export const createAppError = (
  message: string,
  code: ErrorCodes,
  statusCode: number = 500,
  userMessage?: string
): AppError => ({
  message: sanitizeErrorMessage(message),
  code,
  statusCode,
  timestamp: new Date().toISOString(),
  userMessage: userMessage || getUserFriendlyMessage(code)
});

// Get user-friendly error messages
const getUserFriendlyMessage = (code: ErrorCodes): string => {
  switch (code) {
    case ErrorCodes.VALIDATION_ERROR:
      return 'Please check your input and try again.';
    case ErrorCodes.AUTHENTICATION_ERROR:
      return 'Please sign in to continue.';
    case ErrorCodes.AUTHORIZATION_ERROR:
      return 'You do not have permission to perform this action.';
    case ErrorCodes.NETWORK_ERROR:
      return 'Network error. Please check your connection and try again.';
    case ErrorCodes.FILE_UPLOAD_ERROR:
      return 'File upload failed. Please check the file and try again.';
    case ErrorCodes.RATE_LIMIT_ERROR:
      return 'Too many requests. Please wait a moment and try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

// Error logging utility
export const logError = (error: AppError | Error | unknown, context?: string): void => {
  const timestamp = new Date().toISOString();
  const errorData = {
    timestamp,
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: sanitizeErrorMessage(error.message),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    } : error
  };

  // In development, log to console
  if (import.meta.env.DEV) {
    console.error('[Error Log]', errorData);
  }

  // In production, you would send to your error tracking service
  // Example: Sentry, LogRocket, Datadog, etc.
  if (import.meta.env.PROD) {
    // sendToErrorTrackingService(errorData);
  }
};

// Async error handler wrapper
export const withErrorHandling = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, context);
      throw error;
    }
  };
};

// Network error handler
export const handleNetworkError = (error: unknown): AppError => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createAppError(
      'Network request failed',
      ErrorCodes.NETWORK_ERROR,
      0,
      'Unable to connect to the server. Please check your internet connection.'
    );
  }

  return createAppError(
    'Unknown network error',
    ErrorCodes.NETWORK_ERROR,
    0
  );
};

// Supabase error handler
export const handleSupabaseError = (error: unknown): AppError => {
  // Handle specific Supabase error codes
  const errorObj = error as { code?: string; message?: string };
  switch (errorObj?.code) {
    case 'PGRST301':
      return createAppError(
        'Resource not found',
        ErrorCodes.VALIDATION_ERROR,
        404,
        'The requested item could not be found.'
      );
    case 'PGRST116':
      return createAppError(
        'No matching rows found',
        ErrorCodes.VALIDATION_ERROR,
        404,
        'No matching records found.'
      );
    case '23505':
      return createAppError(
        'Duplicate entry',
        ErrorCodes.VALIDATION_ERROR,
        409,
        'This item already exists.'
      );
    case '23503':
      return createAppError(
        'Foreign key constraint violation',
        ErrorCodes.VALIDATION_ERROR,
        400,
        'This action cannot be completed due to related data.'
      );
    default:
      return createAppError(
        error?.message || 'Database error',
        ErrorCodes.SERVER_ERROR,
        500
      );
  }
};
