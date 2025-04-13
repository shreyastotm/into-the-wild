
import { useState, useEffect } from 'react';
import { supabase, WithStringId, convertDbRecordToStringIds } from "@/integrations/supabase/client";
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';
import { userIdToNumber } from '@/utils/dbTypeConversions';

interface DbParticipant {
  user_id: number;
  full_name: string | null;
  avatar_url: string | null;
  booking_datetime: string;
  is_event_creator: boolean;
}

interface Participant {
  id: string;
  name: string | null;
  avatar: string | null;
  joinedAt: string;
  isEventCreator: boolean;
}

interface DbComment {
  comment_id: number;
  trek_id: number;
  user_id: number;
  content: string;
  created_at: string;
  full_name: string | null;
  avatar_url: string | null;
  is_event_creator: boolean;
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
          users:user_id (
            full_name,
            avatar_url
          ),
          trek_events!inner (
            event_creator_id
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
          const isCreator = item.trek_events?.event_creator_id === item.user_id;
          
          return {
            id: String(item.user_id),
            name: item.users?.full_name || null,
            avatar: item.users?.avatar_url || null,
            joinedAt: item.booking_datetime,
            isEventCreator: isCreator
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
        .from('trek_comments')
        .select(`
          comment_id,
          trek_id,
          user_id,
          content,
          created_at,
          users:user_id (
            full_name,
            avatar_url
          ),
          trek_events!inner (
            event_creator_id
          )
        `)
        .eq('trek_id', trekId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform data into the format we need
        const transformedComments: Comment[] = data.map(item => {
          const isCreator = item.trek_events?.event_creator_id === item.user_id;
          
          return {
            id: String(item.comment_id),
            userId: String(item.user_id),
            userName: item.users?.full_name || 'Anonymous User',
            userAvatar: item.users?.avatar_url || null,
            content: item.content,
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
        .from('trek_comments')
        .insert({
          trek_id: parseInt(trekId),
          user_id: userIdToNumber(user.id),
          content: content,
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
