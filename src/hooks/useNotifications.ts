import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import type { Database, Enums } from '../integrations/supabase/types'; // Corrected path

export type NotificationStatus = Enums<'notification_status_enum'>;
export type NotificationType = Enums<'notification_type_enum'>;

export interface Notification {
  id: number;
  user_id: string;
  message: string;
  link?: string | null;
  status: NotificationStatus;
  type: NotificationType;
  trek_id?: number | null;
  related_entity_id?: number | null;
  created_at: string;
  trek_name?: string | null; // From the RPC join
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: any;
  fetchNotifications: (limit?: number, offset?: number) => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getUnreadCount: () => Promise<number>;
}

// Type the Supabase client
type SupabaseClient = ReturnType<typeof useSupabaseClient<Database>>;

const useNotifications = (): UseNotificationsReturn => {
  const supabase = useSupabaseClient<Database>(); // Typed client
  const user = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchNotifications = useCallback(async (limit: number = 10, offset: number = 0) => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      // Ensure the RPC name and parameters match your Supabase setup
      const { data, error: rpcError } = await supabase.rpc('get_user_notifications', {
        p_user_id: user.id,
        p_limit: limit,
        p_offset: offset,
      });

      if (rpcError) throw rpcError;
      
      // Assuming the RPC returns data compatible with Notification[]
      const fetchedNotifications = (data as unknown as Notification[]) || [];
      setNotifications(fetchedNotifications);
      
      const currentUnread = fetchedNotifications.filter(n => n.status === 'unread').length;
      setUnreadCount(currentUnread);

    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  const getUnreadCount = useCallback(async (): Promise<number> => {
    if (!user) return 0;
    try {
      const { count, error: directCountError } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'unread');
      
      if (directCountError) {
        console.error("Error fetching direct unread count:", directCountError);
        // Return the last known unread count in case of error, or 0 if none known
        return unreadCount; 
      }
      const newCount = count || 0;
      setUnreadCount(newCount);
      return newCount;

    } catch (err) {
      console.error('Error in getUnreadCount:', err);
      return unreadCount; // Return last known count on error
    }
  }, [supabase, user, unreadCount]); // Added unreadCount to dependencies as it's returned in error case


  const markAsRead = useCallback(async (notificationId: number) => {
    if (!user) return;
    try {
      const { error: rpcError } = await supabase.rpc('mark_notification_as_read', {
        p_notification_id: notificationId,
        p_user_id: user.id,
      });
      if (rpcError) throw rpcError;
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, status: 'read' as NotificationStatus } : n)
      );
      // Fetch fresh unread count after marking one as read
      await getUnreadCount(); 
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err);
    }
  }, [supabase, user, getUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    try {
      const { error: rpcError } = await supabase.rpc('mark_all_notifications_as_read', {
        p_user_id: user.id,
      });
      if (rpcError) throw rpcError;

      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'read' as NotificationStatus }))
      );
      setUnreadCount(0); // All are read, so count is 0
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (user) {
      fetchNotifications(); // Initial fetch also updates unreadCount
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]); // Removed getUnreadCount as fetchNotifications handles it

  return { 
    notifications, 
    unreadCount, 
    isLoading, 
    error, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    getUnreadCount
  };
};

export default useNotifications; 