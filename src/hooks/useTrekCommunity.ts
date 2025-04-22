import { useState, useEffect } from 'react';
import { supabase, WithStringId, convertDbRecordToStringIds } from "@/integrations/supabase/client";
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';
import { getUniqueParticipantCount } from '@/lib/utils';

interface Participant {
  id: string;
  name: string | null;
  avatar: string | null;
  joinedAt: string;
  isEventCreator: boolean;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  createdAt: string;
  isEventCreator: boolean;
}

export function useTrekCommunity(trek_id: string | undefined) {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [participantCount, setParticipantCount] = useState<number>(0);

  useEffect(() => {
    if (trek_id) {
      fetchParticipants(parseInt(trek_id));
      fetchComments(parseInt(trek_id));
    }
  }, [trek_id]);

  async function fetchParticipants(trek_id: number) {
    try {
      setLoading(true);
      
      console.log('[DEBUG] fetchParticipants called with trek_id:', trek_id);
      
      // Removed redundant event creator role fetch logic
      // Get participants from registrations table (excluding Cancelled)
      const { data, error } = await supabase
        .from('trek_registrations')
        .select('registration_id, user_id, booking_datetime, payment_status')
        .eq('trek_id', trek_id)
        .not('payment_status', 'eq', 'Cancelled');
      if (error) {
        throw error;
      }
      // Defensive: Ensure data is always an array
      const registrations = Array.isArray(data) ? data : (data ? [data] : []);
      // Always deduplicate and filter here
      const uniqueUserIds = Array.from(new Set(registrations.map(item => item.user_id)));
      setParticipantCount(uniqueUserIds.length);
      if (registrations.length > 0) {
        let userMap: Record<string, { full_name?: string | null, avatar_url?: string | null }> = {};
        if (uniqueUserIds.length > 0) {
          try {
            // Always fetch all users, even if not found, to avoid partial userMap
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('user_id, full_name, avatar_url')
              .in('user_id', uniqueUserIds);
            console.log('[DEBUG][PARTICIPANTS] userData:', userData, 'error:', userError, 'uniqueUserIds:', uniqueUserIds);
            // Defensive: Build userMap for all uniqueUserIds, even if userData is missing for some
            uniqueUserIds.forEach(uid => {
              const user = userData && Array.isArray(userData) ? userData.find(u => u.user_id === uid) : null;
              userMap[uid] = {
                full_name: user && typeof user.full_name === 'string' ? user.full_name : null,
                avatar_url: user && typeof user.avatar_url === 'string' ? user.avatar_url : null
              };
            });
            console.log('[DEBUG][PARTICIPANTS] userMap:', userMap);
          } catch (userError) {
            console.error('[DEBUG] Error fetching participant user details:', userError);
            uniqueUserIds.forEach(uid => {
              userMap[uid] = { full_name: null, avatar_url: null };
            });
          }
        }
        const transformedParticipants: Participant[] = uniqueUserIds.map(userId => {
          const reg = registrations.find(item => item.user_id === userId);
          const userDetails = userMap[userId] || { full_name: null, avatar_url: null };
          return {
            id: userId,
            name: userDetails.full_name && userDetails.full_name.trim() !== '' ? userDetails.full_name : 'Anonymous User',
            avatar: userDetails.avatar_url && userDetails.avatar_url.trim() !== '' ? userDetails.avatar_url : null,
            joinedAt: reg ? reg.booking_datetime : '',
            isEventCreator: false // Set to false as event creator role fetch logic is removed
          };
        });
        setParticipants(transformedParticipants);
        console.log('[DEBUG] [PARTICIPANT LOGIC] trek_id:', trek_id, '| uniqueUserIds:', uniqueUserIds, '| count:', uniqueUserIds.length, '| participants:', transformedParticipants);
      } else {
        setParticipants([]);
      }
    } catch (error: any) {
      console.error("Error fetching trek participants:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments(trek_id: number) {
    try {
      setCommentsLoading(true);
      // Removed event creator role fetch logic (roles_assignments table)
      // Fetch comments
      const { data, error } = await supabase
        .from('comments')
        .select('comment_id, user_id, body, created_at')
        .eq('post_id', trek_id)
        .order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      if (data && data.length > 0) {
        // Need to get user details separately
        const userIds = data.map(item => item.user_id);
        // Only use valid UUIDs (36 chars, 4 dashes)
        const validUserIds = userIds.filter(id => typeof id === 'string' && id.length === 36 && (id.match(/-/g) || []).length === 4);
        // Create transformed comments with user_id from comments
        const transformedComments: Comment[] = data.map(item => ({
          id: String(item.comment_id),
          userId: String(item.user_id),
          userName: `User ${item.user_id}`,
          userAvatar: null,
          content: item.body,
          createdAt: item.created_at,
          isEventCreator: false
        }));
        // Try to fetch user details, but don't block if it fails
        try {
          if (validUserIds.length > 0) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('user_id, full_name')
              .in('user_id', validUserIds);
            if (!userError && userData && Array.isArray(userData)) {
              const userMap: Record<string, any> = {};
              userData.forEach(user => {
                if (user && typeof user === 'object' && 'user_id' in user) {
                  userMap[user.user_id] = user;
                }
              });
              transformedComments.forEach(comment => {
                const userDetails = userMap[comment.userId];
                if (userDetails) {
                  comment.userName = userDetails.full_name && userDetails.full_name.trim() !== '' ? userDetails.full_name : 'Anonymous User';
                }
              });
            }
          }
        } catch (userError) {
          console.error("Error fetching comment user details:", userError);
        }
        setComments(transformedComments);
      } else {
        setComments([]);
      }
    } catch (error: any) {
      console.error("Error fetching trek comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  }

  async function addComment(content: string): Promise<boolean> {
    if (!user || !trek_id) return false;

    try {
      setSubmitting(true);
      
      const { error, data } = await supabase
        .from('comments')
        .insert({
          post_id: parseInt(trek_id),
          user_id: user.id,
          body: content,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Supabase Insert Comment Error:', error, { post_id: trek_id, user_id: user.id, body: content });
        toast({
          title: "Failed to add comment",
          description: error.message || "There was an error adding your comment",
          variant: "destructive",
        });
        return false;
      }
      
      // Refresh comments
      await fetchComments(parseInt(trek_id));
      
      toast({
        title: "Comment added",
        description: "Your comment was added successfully",
        variant: "default",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error adding comment:", error, { post_id: trek_id, user_id: user.id, body: content });
      toast({
        title: "Failed to add comment",
        description: error.message || "There was an error adding your comment",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    participants,
    participantCount,
    comments,
    loading,
    commentsLoading,
    submitting,
    addComment
  };
}
