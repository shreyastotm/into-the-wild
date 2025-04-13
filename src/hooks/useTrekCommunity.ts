
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
      const { data: roleData, error: roleError } = await supabase
        .from('roles_assignments')
        .select('user_id')
        .eq('trek_id', trekId)
        .eq('role_type', 'trek_lead')
        .single();
      
      if (roleError) {
        console.error("Error fetching event creator role:", roleError);
      }

      const creatorId = roleData?.user_id || null;
      
      // Get participants from registrations table
      const { data, error } = await supabase
        .from('registrations')
        .select('registration_id, user_id, booking_datetime')
        .eq('trek_id', trekId)
        .eq('payment_status', 'Pending'); // Only show confirmed participants
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Need to get user details separately
        const userIds = data.map(item => item.user_id);
        
        // Convert number array to string array for .in() call
        const userIdsAsStrings = userIds.map(id => id.toString());
        
        // Fetch user details for all participants
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_id, full_name')
          .in('user_id', userIdsAsStrings);
          
        if (userError) {
          console.error("Error fetching participant user details:", userError);
          // If there's an error, we'll continue with empty user data
        }
        
        // Create a map of user IDs to user data for easy lookup
        const userMap: Record<string, any> = {};
        
        if (userData && Array.isArray(userData)) {
          userData.forEach(user => {
            if (user && typeof user === 'object' && 'user_id' in user) {
              userMap[user.user_id] = user;
            }
          });
        }
        
        // Transform data into the format we need
        const transformedParticipants: Participant[] = data.map(item => {
          const userDetails = userMap[item.user_id] || {};
          // Check if this user is the event creator
          const isCreator = creatorId !== null && item.user_id === creatorId;
          
          return {
            id: String(item.user_id),
            name: userDetails.full_name || null,
            avatar: null, // Since avatar_url doesn't exist, we'll set it to null
            joinedAt: item.booking_datetime,
            isEventCreator: isCreator || false
          };
        });
        
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
      const { data: roleData, error: roleError } = await supabase
        .from('roles_assignments')
        .select('user_id')
        .eq('trek_id', trekId)
        .eq('role_type', 'trek_lead')
        .single();
      
      if (roleError) {
        console.error("Error fetching event creator role:", roleError);
      }
      
      const eventCreatorId = roleData?.user_id || null;
      
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
        
        // Convert number array to string array for .in() call
        const userIdsAsStrings = userIds.map(id => id.toString());
        
        // Fetch user details for comment authors
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_id, full_name')
          .in('user_id', userIdsAsStrings);
          
        if (userError) {
          console.error("Error fetching comment user details:", userError);
          // If there's an error, we'll continue with empty user data
        }
        
        // Create a map of user IDs to user data for easy lookup
        const userMap: Record<string, any> = {};
        
        if (userData && Array.isArray(userData)) {
          userData.forEach(user => {
            if (user && typeof user === 'object' && 'user_id' in user) {
              userMap[user.user_id] = user;
            }
          });
        }
        
        // Transform data into the format we need
        const transformedComments: Comment[] = data.map(item => {
          const userDetails = userMap[item.user_id] || {};
          const isCreator = eventCreatorId !== null && item.user_id === eventCreatorId;
          
          return {
            id: String(item.comment_id),
            userId: String(item.user_id),
            userName: userDetails.full_name || 'Anonymous User',
            userAvatar: null, // Since avatar_url doesn't exist, we'll set it to null
            content: item.body,
            createdAt: item.created_at,
            isEventCreator: isCreator
          };
        });
        
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
      
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: parseInt(trekId),
          user_id: userIdToNumber(user.id),
          body: content,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
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
      toast({
        title: "Failed to add comment",
        description: error.message || "There was an error adding your comment",
        variant: "destructive",
      });
      console.error("Error adding comment:", error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    participants,
    comments,
    loading,
    commentsLoading,
    submitting,
    addComment
  };
}
