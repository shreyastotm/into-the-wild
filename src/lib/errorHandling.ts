import { sanitizeErrorMessage } from "./security";
export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  timestamp: string;
  userMessage: string;
}

/**
 * Enhanced error class for application errors (extends existing interface)
 */
export class EnhancedAppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;
  public readonly userMessage: string;

  constructor(
    message: string,
    code: ErrorCodes,
    statusCode: number = 500,
    isOperational: boolean = true,
    userMessage?: string,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.context = context;
    this.userMessage = userMessage || getUserFriendlyMessage(code);

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error codes for different types of errors
export enum ErrorCodes {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  FILE_UPLOAD_ERROR = "FILE_UPLOAD_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  PAYMENT_ERROR = "PAYMENT_ERROR",
  TREK_ERROR = "TREK_ERROR",
}

/**
 * Validation error for form and input validation
 */
export class ValidationError extends EnhancedAppError {
  constructor(
    message: string,
    field?: string,
    context?: Record<string, unknown>,
  ) {
    super(
      message,
      ErrorCodes.VALIDATION_ERROR,
      400,
      true,
      "Please check your input and try again",
      { field, ...context },
    );
  }
}

/**
 * Authentication error for login/auth issues
 */
export class AuthenticationError extends EnhancedAppError {
  constructor(
    message: string = "Authentication failed",
    context?: Record<string, unknown>,
  ) {
    super(
      message,
      ErrorCodes.AUTHENTICATION_ERROR,
      401,
      true,
      "Please sign in to continue",
      context,
    );
  }
}

/**
 * Authorization error for permission issues
 */
export class AuthorizationError extends EnhancedAppError {
  constructor(
    message: string = "Insufficient permissions",
    context?: Record<string, unknown>,
  ) {
    super(
      message,
      ErrorCodes.AUTHORIZATION_ERROR,
      403,
      true,
      "You do not have permission to perform this action",
      context,
    );
  }
}

/**
 * Network error for API and connectivity issues
 */
export class NetworkError extends EnhancedAppError {
  constructor(
    message: string = "Network request failed",
    context?: Record<string, unknown>,
  ) {
    super(
      message,
      ErrorCodes.NETWORK_ERROR,
      0,
      true,
      "Network error. Please check your connection and try again",
      context,
    );
  }
}

/**
 * Database error for Supabase and database issues
 */
export class DatabaseError extends EnhancedAppError {
  constructor(
    message: string = "Database operation failed",
    context?: Record<string, unknown>,
  ) {
    super(
      message,
      ErrorCodes.DATABASE_ERROR,
      500,
      true,
      "An unexpected error occurred. Please try again",
      context,
    );
  }
}

/**
 * Payment error for payment processing issues
 */
export class PaymentError extends EnhancedAppError {
  constructor(
    message: string = "Payment processing failed",
    context?: Record<string, unknown>,
  ) {
    super(
      message,
      ErrorCodes.PAYMENT_ERROR,
      402,
      true,
      "Payment processing failed. Please try again or contact support",
      context,
    );
  }
}

/**
 * Trek-specific errors
 */
export class TrekError extends EnhancedAppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(
      message,
      ErrorCodes.TREK_ERROR,
      400,
      true,
      "There was an issue with this trek. Please contact support",
      context,
    );
  }
}

// Create standardized error responses
export const createAppError = (
  message: string,
  code: ErrorCodes,
  statusCode: number = 500,
  userMessage?: string,
): AppError => ({
  message: sanitizeErrorMessage(message),
  code,
  statusCode,
  timestamp: new Date().toISOString(),
  userMessage: userMessage || getUserFriendlyMessage(code),
});

// Get user-friendly error messages
const getUserFriendlyMessage = (code: ErrorCodes): string => {
  switch (code) {
    case ErrorCodes.VALIDATION_ERROR:
      return "Please check your input and try again.";
    case ErrorCodes.AUTHENTICATION_ERROR:
      return "Please sign in to continue.";
    case ErrorCodes.AUTHORIZATION_ERROR:
      return "You do not have permission to perform this action.";
    case ErrorCodes.NETWORK_ERROR:
      return "Network error. Please check your connection and try again.";
    case ErrorCodes.FILE_UPLOAD_ERROR:
      return "File upload failed. Please check the file and try again.";
    case ErrorCodes.RATE_LIMIT_ERROR:
      return "Too many requests. Please wait a moment and try again.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

// Error logging utility
export const logError = (
  error: AppError | Error | unknown,
  context?: string,
): void => {
  const timestamp = new Date().toISOString();
  const errorData = {
    timestamp,
    context,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: sanitizeErrorMessage(error.message),
            stack:
              process.env.NODE_ENV === "development" ? error.stack : undefined,
          }
        : error,
  };

  // In development, log to console
  if (import.meta.env.DEV) {
    console.error("[Error Log]", errorData);
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
  context?: string,
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
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return createAppError(
      "Network request failed",
      ErrorCodes.NETWORK_ERROR,
      0,
      "Unable to connect to the server. Please check your internet connection.",
    );
  }

  return createAppError("Unknown network error", ErrorCodes.NETWORK_ERROR, 0);
};

// Supabase error handler
export const handleSupabaseError = (error: unknown): AppError => {
  // Handle specific Supabase error codes
  const errorObj = error as { code?: string; message?: string };

  // Handle Supabase Auth specific errors
  if (errorObj?.code === "user_already_exists") {
    return createAppError(
      "User already exists",
      ErrorCodes.VALIDATION_ERROR,
      409,
      "An account with this email already exists. Please try signing in instead.",
    );
  }

  if (errorObj?.message?.includes("No API key found")) {
    return createAppError(
      "API configuration error",
      ErrorCodes.SERVER_ERROR,
      500,
      "Authentication service is not properly configured. Please try again later.",
    );
  }

  if (errorObj?.code === "invalid_credentials") {
    return createAppError(
      "Invalid credentials",
      ErrorCodes.AUTHENTICATION_ERROR,
      401,
      "Invalid email or password. Please check your credentials and try again.",
    );
  }

  if (errorObj?.code === "email_not_confirmed") {
    return createAppError(
      "Email not confirmed",
      ErrorCodes.AUTHENTICATION_ERROR,
      401,
      "Please check your email and click the confirmation link before signing in.",
    );
  }

  if (errorObj?.code === "weak_password") {
    return createAppError(
      "Weak password",
      ErrorCodes.VALIDATION_ERROR,
      400,
      "Password is too weak. Please choose a stronger password.",
    );
  }

  if (errorObj?.code === "invalid_email") {
    return createAppError(
      "Invalid email",
      ErrorCodes.VALIDATION_ERROR,
      400,
      "Please enter a valid email address.",
    );
  }

  // Handle database error codes
  switch (errorObj?.code) {
    case "PGRST301":
      return createAppError(
        "Resource not found",
        ErrorCodes.VALIDATION_ERROR,
        404,
        "The requested item could not be found.",
      );
    case "PGRST116":
      return createAppError(
        "No matching rows found",
        ErrorCodes.VALIDATION_ERROR,
        404,
        "No matching records found.",
      );
    case "23505":
      return createAppError(
        "Duplicate entry",
        ErrorCodes.VALIDATION_ERROR,
        409,
        "This item already exists.",
      );
    case "23503":
      return createAppError(
        "Foreign key constraint violation",
        ErrorCodes.VALIDATION_ERROR,
        400,
        "This action cannot be completed due to related data.",
      );
    default:
      return createAppError(
        errorObj?.message || "Database error",
        ErrorCodes.SERVER_ERROR,
        500,
        "An unexpected error occurred. Please try again.",
      );
  }
};

// Trek-specific error creators
export const createTrekError = (
  message: string,
  userMessage?: string,
): AppError => {
  return createAppError(message, ErrorCodes.VALIDATION_ERROR, 400, userMessage);
};

export const createPaymentError = (
  message: string,
  userMessage?: string,
): AppError => {
  return createAppError(
    message,
    ErrorCodes.SERVER_ERROR,
    402,
    userMessage ||
      "Payment processing failed. Please try again or contact support.",
  );
};

// Network status utilities
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [connectionType, setConnectionType] = React.useState<
    "slow" | "fast" | "unknown"
  >("unknown");

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const updateConnectionType = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        setConnectionType(
          effectiveType === "slow-2g" || effectiveType === "2g"
            ? "slow"
            : "fast",
        );
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", updateConnectionType);
      updateConnectionType();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (connection) {
        connection.removeEventListener("change", updateConnectionType);
      }
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isSlowConnection: connectionType === "slow",
  };
}

// Retry utility for failed operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context?: string,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      logError(error, `${context} - Attempt ${attempt}/${maxRetries}`);

      if (isLastAttempt) {
        throw error;
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, attempt - 1)),
      );
    }
  }

  throw new Error("This should never be reached");
}

// Safe async operation wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T,
  context?: string,
): Promise<{ data: T | undefined; error: AppError | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const appError =
      error instanceof Error && "code" in error
        ? (error as AppError)
        : handleSupabaseError(error);

    logError(appError, context);

    return {
      data: fallback,
      error: appError,
    };
  }
}

/**
 * Error message translator for user-friendly messages
 */
export class ErrorMessageTranslator {
  private static readonly errorMessages: Record<string, string> = {
    // Authentication errors
    AUTHENTICATION_ERROR: "Please log in to continue",
    AUTHORIZATION_ERROR: "You do not have permission to perform this action",

    // Network errors
    NETWORK_ERROR: "Network error. Please check your connection and try again",
    "Failed to fetch": "Unable to connect to the server. Please try again.",

    // Database errors
    DATABASE_ERROR: "An unexpected error occurred. Please try again",
    "Row Level Security policy violation":
      "You do not have permission to access this data",

    // Validation errors
    VALIDATION_ERROR: "Please check your input and try again",
    "Invalid email format": "Please enter a valid email address",
    "Password too short": "Password must be at least 8 characters long",
    "Phone number invalid": "Please enter a valid Indian mobile number",

    // Payment errors
    PAYMENT_ERROR:
      "Payment processing failed. Please try again or contact support",

    // Trek errors
    TREK_ERROR: "There was an issue with this trek. Please contact support",
    "Trek is full": "Sorry, this trek is already full",
    "Registration deadline passed": "Registration for this trek has closed",

    // Generic fallbacks
    "Unknown error": "Something unexpected happened. Please try again",
  };

  static translate(error: Error | EnhancedAppError): string {
    const message = error.message || "Unknown error";

    // Check for exact match first
    if (this.errorMessages[message]) {
      return this.errorMessages[message];
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(this.errorMessages)) {
      if (message.includes(key)) {
        return value;
      }
    }

    // Return generic message for unknown errors
    return this.errorMessages["Unknown error"];
  }
}

/**
 * Error logging utility
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: Array<{
    error: Error;
    timestamp: Date;
    context?: Record<string, unknown>;
    userId?: string;
    sessionId?: string;
  }> = [];

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  log(
    error: Error,
    context?: Record<string, unknown>,
    userId?: string,
    sessionId?: string,
  ): void {
    const logEntry = {
      error,
      timestamp: new Date(),
      context,
      userId,
      sessionId,
    };

    this.logs.push(logEntry);

    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error logged:", {
        message: error.message,
        stack: error.stack,
        context,
        userId,
        sessionId,
      });
    }
  }

  getLogs(): Array<{
    error: Error;
    timestamp: Date;
    context?: Record<string, unknown>;
    userId?: string;
    sessionId?: string;
  }> {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}
