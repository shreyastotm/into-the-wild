import { useState, useEffect } from 'react';
import { supabase, WithStringId, convertDbRecordToStringIds } from "@/integrations/supabase/client";
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';
import { userIdToNumber } from '@/utils/dbTypeConversions';

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

export function useTrekCommunity(trekId: string | undefined) {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [participantCount, setParticipantCount] = useState<number>(0);

  useEffect(() => {
    if (trekId) {
      fetchParticipants(parseInt(trekId));
      fetchComments(parseInt(trekId));
    }
  }, [trekId]);

  async function fetchParticipants(trekId: number) {
    try {
      setLoading(true);
      
      // Get the event creator ID - using correct role type trek_lead
      let creatorId = null;
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('roles_assignments')
          .select('user_id')
          .eq('trek_id', trekId)
          .eq('role_type', 'trek_lead')
          .maybeSingle();
        
        if (!roleError && roleData) {
          creatorId = roleData.user_id;
        }
      } catch (error) {
        console.error("Error fetching event creator role:", error);
      }
      
      // Get participants from registrations table (excluding Cancelled)
      const { data, error } = await supabase
        .from('registrations')
        .select('registration_id, user_id, booking_datetime, payment_status')
        .eq('trek_id', trekId)
        .not('payment_status', 'eq', 'Cancelled');
      
      if (error) {
        throw error;
      }
      // Count unique user IDs only
      const uniqueUserIds = Array.from(new Set((data || []).map(item => item.user_id)));
      setParticipantCount(uniqueUserIds.length);
      if (data && data.length > 0) {
        const userIds = uniqueUserIds;
        const validUserIds = userIds.filter(id => typeof id === 'string' && id.length === 36 && (id.match(/-/g) || []).length === 4);
        // Only one participant per unique user
        const transformedParticipants: Participant[] = uniqueUserIds.map(userId => {
          // Find the earliest registration for this user
          const reg = data.find(item => item.user_id === userId);
          const isCreator = creatorId !== null && userId === creatorId;
          return {
            id: String(userId),
            name: `User ${userId}`,
            avatar: null,
            joinedAt: reg?.booking_datetime || new Date().toISOString(),
            isEventCreator: isCreator || false
          };
        });
        try {
          if (validUserIds.length > 0) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('user_id, full_name, avatar_url')
              .in('user_id', validUserIds);
            
            if (!userError && userData && Array.isArray(userData)) {
              const userMap: Record<string, any> = {};
              userData.forEach(user => {
                if (user && typeof user === 'object' && 'user_id' in user) {
                  userMap[user.user_id] = user;
                }
              });
              transformedParticipants.forEach(participant => {
                const userDetails = userMap[participant.id];
                if (userDetails) {
                  participant.name = userDetails.full_name || participant.name;
                  participant.avatar = userDetails.avatar_url || null;
                }
              });
            }
          }
        } catch (userError) {
          console.error("Error fetching participant user details:", userError);
        }
        setParticipants(transformedParticipants);
      } else {
        setParticipants([]);
      }
    } catch (error: any) {
      console.error("Error fetching trek participants:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments(trekId: number) {
    try {
      setCommentsLoading(true);
      
      // Get the event creator ID - using correct role type trek_lead
      let eventCreatorId = null;
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('roles_assignments')
          .select('user_id')
          .eq('trek_id', trekId)
          .eq('role_type', 'trek_lead')
          .maybeSingle();
        
        if (!roleError && roleData) {
          eventCreatorId = roleData.user_id;
        }
      } catch (error) {
        console.error("Error fetching event creator role:", error);
      }
      
      // Fetch comments
      const { data, error } = await supabase
        .from('comments')
        .select('comment_id, user_id, body, created_at')
        .eq('post_id', trekId)
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
        const transformedComments: Comment[] = data.map(item => {
          const isCreator = eventCreatorId !== null && item.user_id === eventCreatorId;
          
          return {
            id: String(item.comment_id),
            userId: String(item.user_id),
            userName: `User ${item.user_id}`, // Default name until we get user details
            userAvatar: null,
            content: item.body,
            createdAt: item.created_at,
            isEventCreator: isCreator
          };
        });
        
        // Try to fetch user details, but don't block if it fails
        try {
          if (validUserIds.length > 0) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('user_id, full_name')
              .in('user_id', validUserIds);
              
            if (!userError && userData && Array.isArray(userData)) {
              // Create a map of user IDs to user data for easy lookup
              const userMap: Record<string, any> = {};
              userData.forEach(user => {
                if (user && typeof user === 'object' && 'user_id' in user) {
                  userMap[user.user_id] = user;
                }
              });
              
              // Update comment user names if we found the user data
              transformedComments.forEach(comment => {
                const userDetails = userMap[comment.userId];
                if (userDetails) {
                  comment.userName = userDetails.full_name || comment.userName;
                }
              });
            }
          }
        } catch (userError) {
          console.error("Error fetching comment user details:", userError);
          // Continue with default user names
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
    if (!user || !trekId) return false;

    try {
      setSubmitting(true);
      
      const { error, data } = await supabase
        .from('comments')
        .insert({
          post_id: parseInt(trekId),
          user_id: userIdToNumber(user.id),
          body: content,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Supabase Insert Comment Error:', error, { post_id: trekId, user_id: userIdToNumber(user.id), body: content });
        toast({
          title: "Failed to add comment",
          description: error.message || "There was an error adding your comment",
          variant: "destructive",
        });
        return false;
      }
      
      // Refresh comments
      await fetchComments(parseInt(trekId));
      
      toast({
        title: "Comment added",
        description: "Your comment was added successfully",
        variant: "default",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error adding comment:", error, { post_id: trekId, user_id: userIdToNumber(user.id), body: content });
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
