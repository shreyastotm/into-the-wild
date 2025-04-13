
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
      
      // Get participants with user profiles joined
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          user_id,
          booking_datetime,
          users (
            full_name,
            avatar_url
          ),
          trek_events!inner (
            user_id
          )
        `)
        .eq('trek_id', trekId)
        .eq('payment_status', 'Pending'); // Only show confirmed participants
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform data into the format we need
        const transformedParticipants: Participant[] = data.map(item => {
          // Check if this user is the event creator
          const isCreator = item.trek_events && item.trek_events.user_id === item.user_id;
          
          return {
            id: String(item.user_id),
            name: item.users?.full_name || null,
            avatar: item.users?.avatar_url || null,
            joinedAt: item.booking_datetime,
            isEventCreator: isCreator || false
          };
        });
        
        setParticipants(transformedParticipants);
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
      
      // Get comments with user profiles joined
      const { data, error } = await supabase
        .from('comments')
        .select(`
          comment_id,
          user_id,
          body,
          created_at,
          users (
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', trekId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Get the event creator ID for comparison
        const { data: eventData, error: eventError } = await supabase
          .from('trek_events')
          .select('user_id')
          .eq('trek_id', trekId)
          .single();
        
        if (eventError) {
          console.error("Error fetching event creator:", eventError);
        }
        
        const eventCreatorId = eventData?.user_id || null;
        
        // Transform data into the format we need
        const transformedComments: Comment[] = data.map(item => {
          const isCreator = eventCreatorId !== null && item.user_id === eventCreatorId;
          
          return {
            id: String(item.comment_id),
            userId: String(item.user_id),
            userName: item.users?.full_name || 'Anonymous User',
            userAvatar: item.users?.avatar_url || null,
            content: item.body,
            createdAt: item.created_at,
            isEventCreator: isCreator
          };
        });
        
        setComments(transformedComments);
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
