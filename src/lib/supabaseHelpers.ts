import { supabase } from '@/integrations/supabase/client';

/**
 * Simplified helpers for Supabase to avoid deep TypeScript recursion
 */

export interface SimpleUser {
  user_id: string;
  name?: string;
  full_name?: string;
  [key: string]: any;
}

export interface SimpleRegistration {
  user_id: string;
  [key: string]: any;
}

/**
 * Fetch user IDs from trek registrations with simplified types
 */
export async function fetchTrekRegistrationUserIds(trekId: number): Promise<string[]> {
  try {
    // Simplest approach to avoid TypeScript recursion
    const query = `
      SELECT user_id FROM trek_registrations 
      WHERE trek_id = ${trekId} 
      AND payment_status != 'Cancelled'
    `;
    
    // @ts-ignore - Bypass TypeScript's deep type recursion
    const { data, error } = await supabase.rpc('execute_sql_readonly', { sql_query: query });
    
    if (error) {
      console.error('Error fetching registrations:', error);
      return [];
    }
    
    // Process the result safely
    const userIds: string[] = [];
    if (data && Array.isArray(data)) {
      // Type assertion to let TypeScript know data is iterable
      const itemsArray = data as Array<any>;
      for (const item of itemsArray) {
        if (item && typeof item === 'object' && 'user_id' in item) {
          const userId = item.user_id;
          if (userId && typeof userId === 'string') {
            userIds.push(userId);
          }
        }
      }
    }
    
    return userIds;
  } catch (error) {
    console.error('Error in fetchTrekRegistrationUserIds:', error);
    return [];
  }
}

/**
 * Fetch user details by IDs with simplified types
 */
export async function fetchUsersByIds(userIds: string[]): Promise<SimpleUser[]> {
  if (!userIds.length) return [];
  
  try {
    // Handle small batches to avoid URL length issues
    const batchSize = 10;
    const batches: string[][] = [];
    
    // Split userIds into batches
    for (let i = 0; i < userIds.length; i += batchSize) {
      batches.push(userIds.slice(i, i + batchSize));
    }
    
    // Process each batch
    const allUsers: SimpleUser[] = [];
    
    for (const batch of batches) {
      const idList = batch.map(id => `'${id}'`).join(',');
      const query = `
        SELECT user_id, name, full_name 
        FROM users 
        WHERE user_id IN (${idList})
      `;
      
      // @ts-ignore - Bypass TypeScript's deep type recursion
      const { data, error } = await supabase.rpc('execute_sql_readonly', { sql_query: query });
      
      if (error) {
        console.error('Error fetching users batch:', error);
        continue;
      }
      
      // Process the result safely
      if (data && Array.isArray(data)) {
        // Type assertion to let TypeScript know data is iterable
        const itemsArray = data as Array<any>;
        for (const item of itemsArray) {
          if (item && typeof item === 'object' && 'user_id' in item) {
            allUsers.push({
              user_id: item.user_id,
              name: item.name,
              full_name: item.full_name
            });
          }
        }
      }
    }
    
    return allUsers;
  } catch (error) {
    console.error('Error in fetchUsersByIds:', error);
    return [];
  }
} 