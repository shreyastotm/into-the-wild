/**
 * Utility functions for handling database type conversions
 * These help ensure consistent type handling between the frontend and database
 */

/**
 * Converts a user ID to a string (UUID expected everywhere)
 */
export const userIdToString = (userId: string | number): string => {
  return String(userId);
};

/**
 * Type guard to check if a value is a valid UUID (basic check)
 */
export const isValidUserId = (userId: unknown): boolean => {
  if (typeof userId !== 'string') return false;
  // Basic UUID v4 pattern check
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
};

/**
 * A helper function to standardize ID types in API responses
 * Useful for maintaining consistent types throughout the application
 */
export const standardizeIds = <T extends Record<string, unknown>>(data: T): T => {
  // Create an intermediate result object with a more flexible type
  const result: Record<string, unknown> = { ...data };
  
  // Convert ID fields to their expected types
  for (const key in result) {
    if (key.endsWith('_id') && result[key] !== null && result[key] !== undefined) {
      // For frontend use, convert to string
      result[key] = String(result[key]);
    }
  }
  
  // Cast back to the original type
  return result as T;
};
