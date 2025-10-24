/**
 * Security utilities for input validation and sanitization
 */

// XSS Protection - sanitize HTML content
export const sanitizeHtml = (input: string): string => {
  if (!input) return "";

  // Remove script tags and their content
  let sanitized = input.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );

  // Remove dangerous event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^>]*/gi, "");

  // Remove javascript: protocols
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Remove data: protocols that could contain scripts
  sanitized = sanitized.replace(/data:\s*text\/html/gi, "");

  return sanitized.trim();
};

// SQL Injection Protection - validate and sanitize inputs
export const sanitizeInput = (
  input: string | number | null | undefined,
): string => {
  if (input === null || input === undefined) return "";

  const str = String(input);

  // Remove SQL injection patterns
  const dangerous = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /('|"|;|--|\/\*|\*\/)/g,
    /(=|<|>|\||&)/g,
  ];

  let sanitized = str;
  dangerous.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "");
  });

  return sanitized.trim();
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// Phone validation (Indian format)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
};

// Validate numeric inputs
export const validateNumber = (
  value: string | number,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER,
): boolean => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return !isNaN(num) && num >= min && num <= max;
};

// File upload validation
export const validateFile = (
  file: File,
  allowedTypes: string[],
  maxSize: number,
): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
    };
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.php$/,
    /\.jsp$/,
    /\.asp$/,
    /\.js$/,
    /\.html$/,
    /\.htm$/,
  ];
  if (
    suspiciousPatterns.some((pattern) => pattern.test(file.name.toLowerCase()))
  ) {
    return { valid: false, error: "Suspicious file type detected" };
  }

  return { valid: true };
};

// Rate limiting helper (client-side)
interface RateLimitConfig {
  requests: number;
  windowMs: number;
}

class RateLimiter {
  private attempts = new Map<string, number[]>();

  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get existing attempts for this key
    const userAttempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter((time) => time > windowStart);

    // Check if under limit
    if (validAttempts.length >= config.requests) {
      return false;
    }

    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);

    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Content Security Policy helpers
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
};

// Error message sanitization - prevent information disclosure
export const sanitizeErrorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[IP]")
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]")
      .replace(/password|secret|key|token/gi, "[REDACTED]");
  }

  if (error instanceof Error) {
    return sanitizeErrorMessage(error.message);
  }

  return "An unexpected error occurred";
};

// URL validation
export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ["http:", "https:"].includes(urlObj.protocol);
  } catch {
    return false;
  }
};
