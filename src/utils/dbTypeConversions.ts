
/**
 * Utility functions for handling database type conversions
 * These help ensure consistent type handling between the frontend and database
 */

/**
 * Converts a user ID (which may be a UUID string in auth but number in database) to a number
 * Gracefully handles potential parsing errors
 */
export const userIdToNumber = (userId: string | number): number => {
  if (typeof userId === 'number') return userId;
  try {
    return parseInt(userId);
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
