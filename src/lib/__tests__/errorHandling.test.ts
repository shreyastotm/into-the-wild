/**
 * Tests for Error Handling System
 *
 * @author Into The Wild Development Team
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  EnhancedAppError,
  ErrorCodes,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  DatabaseError,
  PaymentError,
  TrekError,
  ErrorLogger,
  ErrorMessageTranslator,
  withRetry,
  safeAsync,
  handleSupabaseError,
  createAppError,
  logError,
} from "../errorHandling";

// Mock console.error for testing
const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("Error Handling System", () => {
  beforeEach(() => {
    mockConsoleError.mockClear();
  });

  describe("EnhancedAppError", () => {
    it("should create error with all properties", () => {
      const error = new EnhancedAppError(
        "Test error message",
        ErrorCodes.VALIDATION_ERROR,
        400,
        true,
        "User friendly message",
        { field: "email" },
      );

      expect(error.message).toBe("Test error message");
      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.userMessage).toBe("User friendly message");
      expect(error.context).toEqual({ field: "email" });
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.name).toBe("EnhancedAppError");
    });

    it("should use default values when not provided", () => {
      const error = new EnhancedAppError("Test error", ErrorCodes.SERVER_ERROR);

      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.userMessage).toBe(
        "An unexpected error occurred. Please try again.",
      );
    });
  });

  describe("Specific Error Types", () => {
    it("should create ValidationError correctly", () => {
      const error = new ValidationError("Email is required", "email");

      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.context?.field).toBe("email");
    });

    it("should create AuthenticationError correctly", () => {
      const error = new AuthenticationError("Invalid credentials");

      expect(error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Invalid credentials");
    });

    it("should create NetworkError correctly", () => {
      const error = new NetworkError("Connection failed");

      expect(error.code).toBe(ErrorCodes.NETWORK_ERROR);
      expect(error.statusCode).toBe(0);
      expect(error.message).toBe("Connection failed");
    });
  });

  describe("ErrorLogger", () => {
    it("should log errors correctly", () => {
      const logger = ErrorLogger.getInstance();
      const error = new Error("Test error");

      logger.log(error, { userId: "123" }, "user-123", "session-456");

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].error.message).toBe("Test error");
      expect(logs[0].context).toEqual({ userId: "123" });
      expect(logs[0].userId).toBe("user-123");
      expect(logs[0].sessionId).toBe("session-456");
    });

    it("should clear logs", () => {
      const logger = ErrorLogger.getInstance();
      const error = new Error("Test error");

      logger.log(error);
      expect(logger.getLogs()).toHaveLength(1);

      logger.clearLogs();
      expect(logger.getLogs()).toHaveLength(0);
    });

    it("should maintain singleton instance", () => {
      const logger1 = ErrorLogger.getInstance();
      const logger2 = ErrorLogger.getInstance();

      expect(logger1).toBe(logger2);
    });

    it("should limit logs to 1000 entries", () => {
      const logger = ErrorLogger.getInstance();

      // Add more than 1000 logs
      for (let i = 0; i < 1005; i++) {
        logger.log(new Error(`Error ${i}`));
      }

      expect(logger.getLogs()).toHaveLength(1000);
      expect(logger.getLogs()[0].error.message).toBe("Error 5"); // First 5 were removed
    });
  });

  describe("ErrorMessageTranslator", () => {
    it("should translate known error messages", () => {
      const error = new AuthenticationError();
      const message = ErrorMessageTranslator.translate(error);

      expect(message).toBe("Please log in to continue");
    });

    it("should handle partial message matches", () => {
      const error = new Error("Invalid email format provided");
      const message = ErrorMessageTranslator.translate(error);

      expect(message).toBe("Please enter a valid email address");
    });

    it("should provide fallback for unknown errors", () => {
      const error = new Error("Some completely unknown error");
      const message = ErrorMessageTranslator.translate(error);

      expect(message).toBe("Something unexpected happened. Please try again");
    });
  });

  describe("withRetry", () => {
    it("should succeed on first attempt", async () => {
      const operation = vi.fn().mockResolvedValue("success");

      const result = await withRetry(operation, 3, 100);

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should retry on failure and eventually succeed", async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error("Fail 1"))
        .mockRejectedValueOnce(new Error("Fail 2"))
        .mockResolvedValue("success");

      const result = await withRetry(operation, 3, 100);

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it("should fail after max retries", async () => {
      const operation = vi.fn().mockRejectedValue(new Error("Always fails"));

      await expect(withRetry(operation, 2, 100)).rejects.toThrow(
        "Always fails",
      );
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe("safeAsync", () => {
    it("should return success result", async () => {
      const operation = async () => "success data";

      const result = await safeAsync(operation);

      expect(result.data).toBe("success data");
      expect(result.error).toBeNull();
    });

    it("should return error result on failure", async () => {
      const operation = async () => {
        throw new Error("Operation failed");
      };

      const result = await safeAsync(operation);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Operation failed");
    });

    it("should return fallback data on error", async () => {
      const operation = async () => {
        throw new Error("Operation failed");
      };

      const result = await safeAsync(operation, "fallback data");

      expect(result.data).toBe("fallback data");
      expect(result.error).toBeDefined();
    });
  });

  describe("createAppError", () => {
    it("should create app error with all properties", () => {
      const error = createAppError(
        "Test error",
        ErrorCodes.VALIDATION_ERROR,
        400,
        "User friendly message",
      );

      expect(error.message).toBe("Test error");
      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.userMessage).toBe("User friendly message");
      expect(error.timestamp).toBeDefined();
    });
  });

  describe("handleSupabaseError", () => {
    it("should handle user already exists error", () => {
      const supabaseError = {
        code: "user_already_exists",
        message: "User exists",
      };
      const error = handleSupabaseError(supabaseError);

      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(error.statusCode).toBe(409);
      expect(error.userMessage).toContain("already exists");
    });

    it("should handle invalid credentials error", () => {
      const supabaseError = {
        code: "invalid_credentials",
        message: "Bad credentials",
      };
      const error = handleSupabaseError(supabaseError);

      expect(error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
      expect(error.statusCode).toBe(401);
      expect(error.userMessage).toContain("Invalid email or password");
    });

    it("should handle database constraint errors", () => {
      const supabaseError = { code: "23505", message: "Duplicate key" };
      const error = handleSupabaseError(supabaseError);

      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(error.statusCode).toBe(409);
      expect(error.userMessage).toBe("This item already exists.");
    });

    it("should handle unknown errors", () => {
      const supabaseError = { code: "unknown_code", message: "Unknown error" };
      const error = handleSupabaseError(supabaseError);

      expect(error.code).toBe(ErrorCodes.SERVER_ERROR);
      expect(error.statusCode).toBe(500);
    });
  });
});
