import { useState, useEffect, useCallback } from 'react';
import { supabase, WithStringId, convertDbRecordToStringIds } from "@/integrations/supabase/client";
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';
import { getUniqueParticipantCount } from '@/lib/utils';

interface Participant {
  id: string;
  name: string;
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

export const useTrekCommunity = (trekId: string | undefined) => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const numericTrekId = trekId ? parseInt(trekId, 10) : undefined;

  const fetchCommunityData = useCallback(async () => {
    if (!numericTrekId) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch Participants (Two-Step)
      // Step 1: Fetch registrations
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('trek_registrations')
        .select('user_id, booking_datetime') // Select needed fields, removed payment_status if problematic/not needed here
        .eq('trek_id', numericTrekId)
        // .not('payment_status', 'eq', 'Cancelled') // Temporarily remove filter causing issues?
        .order('booking_datetime', { ascending: true });

      if (registrationsError) {
        console.error("Error fetching registrations:", registrationsError);
        throw new Error(`Failed to fetch registrations: ${registrationsError.message}`);
      }
      
      let fetchedParticipants: Participant[] = [];
      if (registrationsData && registrationsData.length > 0) {
          // Step 2: Fetch user details
          const userIds = registrationsData.map(reg => reg.user_id).filter(Boolean);
          if (userIds.length > 0) {
              const { data: usersData, error: usersError } = await supabase
                  .from('users')
                  .select('user_id, name, avatar_url') // Use name
                  .in('user_id', userIds);
              
              if (usersError) {
                  console.error("Error fetching participant user details:", usersError);
                  // Continue without user details if this fails?
              }

              // Step 3: Combine registration and user data, mapping to Participant interface
              fetchedParticipants = registrationsData.map(reg => {
                  const userDetail = usersData?.find(u => u.user_id === reg.user_id);
                  return {
                      id: reg.user_id, // Map user_id to id
                      name: userDetail?.name || 'Loading...',
                      avatar: userDetail?.avatar_url || null, // Map avatar_url to avatar
                      joinedAt: reg.booking_datetime || new Date().toISOString(), // Map booking_datetime to joinedAt
                      isEventCreator: false // Determine this based on roles/creator logic if needed elsewhere
                  };
              });
          }
      }
      setParticipants(fetchedParticipants);

      // Fetch Comments (Two-Step)
      // Step 1: Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
          .from('trek_comments')
          .select('comment_id, user_id, body, created_at') // Use body
          .eq('trek_id', numericTrekId)
          .order('created_at', { ascending: true });
      
      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
        throw new Error(`Failed to fetch comments: ${commentsError.message}`);
      }

      let fetchedComments: Comment[] = [];
      if (commentsData && commentsData.length > 0) {
           // Step 2: Fetch user details for comment authors
           const commentUserIds = [...new Set(commentsData.map(c => c.user_id).filter(Boolean))];
           let commentUsersData: { user_id: string; name: string; avatar_url: string | null }[] = [];
           if (commentUserIds.length > 0) {
               const { data: usersData, error: usersError } = await supabase
                   .from('users')
                   .select('user_id, name, avatar_url') // Use name
                   .in('user_id', commentUserIds);
               if (usersError) {
                   console.error("Error fetching comment user details:", usersError);
               } else {
                   commentUsersData = usersData || [];
               }
           }

           // Step 3: Combine comment and user data, mapping to Comment interface
           fetchedComments = commentsData.map(comment => {
               const author = commentUsersData.find(u => u.user_id === comment.user_id);
               return {
                   id: comment.comment_id.toString(), // Map comment_id to id (as string)
                   userId: comment.user_id,
                   userName: author?.name || 'Unknown User',
                   userAvatar: author?.avatar_url || null,
                   content: comment.body, // Map body to content
                   createdAt: comment.created_at,
                   isEventCreator: false // Determine if needed
               };
           });
      }
      setComments(fetchedComments);

    } catch (err: any) {
      console.error("Error fetching community data:", err);
      setError(err.message || 'Failed to load community data');
      setParticipants([]);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [numericTrekId]);

  // Add Comment Function
  const addComment = useCallback(async (commentText: string) => {
    if (!numericTrekId || !commentText.trim() || !user) {
        toast({ title: "Cannot add comment", description: "Missing information or not logged in.", variant: "destructive" });
        return; 
    }

    setSubmitting(true);
    try {
        const { data: newCommentData, error } = await supabase
            .from('trek_comments')
            .insert({
                trek_id: numericTrekId,
                user_id: user.id, // Safe now due to check above
                body: commentText.trim(), // Use body
            })
            .select('comment_id, user_id, body, created_at') // Use body
            .single();

        if (error) throw error;

        if (newCommentData) {
            // Use the updated Participant interface which uses 'id'
            const author = participants.find(p => p.id === newCommentData.user_id) 
                        ?? { id: newCommentData.user_id, name: 'You', avatar: user?.user_metadata?.avatar_url || null, joinedAt: '' }; // Use id, avatar
            
            // Map to the Comment interface
            const formattedComment: Comment = {
                id: newCommentData.comment_id.toString(),
                userId: newCommentData.user_id,
                userName: author.name,
                userAvatar: author.avatar, // Use avatar
                content: newCommentData.body,
                createdAt: newCommentData.created_at,
                isEventCreator: false // Determine if needed
            };
            setComments(prev => [...prev, formattedComment]);
            toast({ title: "Comment added", variant: "default" });
        }
    } catch (error: any) {
        console.error("Error adding comment:", error);
        toast({ title: "Error", description: `Failed to add comment: ${error.message}`, variant: "destructive" });
    } finally {
        setSubmitting(false);
    }
  }, [numericTrekId, user, participants, user?.user_metadata?.avatar_url]);

  useEffect(() => {
    if (trekId) {
      fetchCommunityData();
    }
  }, [trekId]);

  return {
    participants,
    participantCount,
    comments,
    loading,
    commentsLoading,
    submitting,
    addComment,
    error
  };
}
