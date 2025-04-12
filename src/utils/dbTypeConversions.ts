
/**
 * Utility functions for handling database type conversions
 * These help ensure consistent type handling between the frontend and database
 */

/**
 * Converts a user ID (which may be a string in auth but number in database) to a number
 * Gracefully handles potential parsing errors
 */
export const userIdToNumber = (userId: string | number): number => {
  if (typeof userId === 'number') return userId;
  try {
    const parsed = parseInt(userId);
    if (isNaN(parsed)) {
      throw new Error('Invalid user ID format');
    }
    return parsed;
  } catch (e) {
    console.error('Error converting userId to number:', e);
    throw new Error('Invalid user ID format');
  }
};

/**
 * Converts a database user ID (number) to string format
 * Useful when we need to compare with auth user IDs
 */
export const userIdToString = (userId: number | string): string => {
  return String(userId);
};

/**
 * Type guard to check if a value is a valid user ID
 */
export const isValidUserId = (userId: any): boolean => {
  if (typeof userId === 'number') return true;
  if (typeof userId === 'string') {
    return !isNaN(parseInt(userId));
  }
  return false;
};

/**
 * A helper function to standardize ID types in API responses
 * Useful for maintaining consistent types throughout the application
 */
export const standardizeIds = <T extends Record<string, any>>(data: T): T => {
  // Create an intermediate result object with a more flexible type
  const result: Record<string, any> = { ...data };
  
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
