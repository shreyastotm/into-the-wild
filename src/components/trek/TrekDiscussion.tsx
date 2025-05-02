import React, { useState } from 'react';
import { MessageSquare, Send, Smile, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/auth/AuthProvider';
import { Separator } from '@/components/ui/separator'; // Keep if used, otherwise remove
import { toast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// Updated interface to match useTrekCommunity hook
export interface Comment {
  id: string;
  user_id: string; // Changed from userId
  user_name: string; // Changed from userName
  user_avatar_url?: string | null; // Changed from userAvatar
  content: string;
  created_at: string; // Changed from createdAt
  is_event_creator?: boolean; // Changed from isEventCreator
}

interface TrekDiscussionProps {
  trekId: string;
  comments: Comment[];
  onAddComment?: (content: string) => Promise<boolean>; // Callback returns success status
  isLoading?: boolean; // Loading state for comments list
  commentsLoading?: boolean; // Alias or separate loading state? Use isLoading
}

export const TrekDiscussion: React.FC<TrekDiscussionProps> = ({ 
  trekId,
  comments,
  onAddComment,
  isLoading = false // Renamed/unified prop
}) => {
  const { user, userProfile } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAddComment = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to participate in discussions",
        variant: "destructive",
      });
      return;
    }
    
    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (onAddComment) {
        const success = await onAddComment(newComment.trim());
        if (success) {
          setNewComment(''); // Clear input only on success
           toast({
             title: "Comment posted!",
             variant: "default",
           });
        } else {
           // Error handled within the hook/callback usually, but can add generic one
           toast({
            title: "Comment failed",
            description: "Unable to add your comment. Please try again.",
            variant: "destructive",
           });
        }
      } else {
        console.warn('TrekDiscussion: onAddComment prop is not provided.');
        toast({
          title: "Cannot add comment",
          description: "Comment functionality not connected.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in handleAddComment:", error);
      toast({
        title: "Comment failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Basic emoji picker example
  const emojis = ['😊', '👍', '🎉', '❤️', '😂', '🤔', '🙏', '🔥'];
  const addEmoji = (emoji: string) => {
    setNewComment(prev => prev + emoji);
  };
  
  // Sort comments by creation date (newest first)
  const sortedComments = [...comments].sort((a, b) => 
     new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold flex items-center">
        <MessageSquare className="h-5 w-5 mr-2 text-primary" />
        Discussion ({sortedComments.length})
      </h3>
      
      {/* Comment Input Section */}
      {user ? (
        <div className="flex gap-3 items-start">
          <Avatar className="h-10 w-10 mt-1">
            <AvatarImage src={userProfile?.avatar_url || undefined} alt={userProfile?.full_name || 'User'} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {(userProfile?.full_name || user.email || 'U').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Share your thoughts, ask questions, or coordinate details..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] mb-2 focus-visible:ring-primary/50"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center">
               <Popover>
                 <PopoverTrigger asChild>
                   <Button 
                      variant="ghost" 
                      size="icon" 
                      type="button" 
                      className="text-muted-foreground hover:bg-muted hover:text-foreground"
                      disabled={isSubmitting}
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-auto p-2">
                    <div className="grid grid-cols-4 gap-1">
                       {emojis.map(emoji => (
                         <Button 
                           key={emoji} 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => addEmoji(emoji)} 
                           className="text-xl"
                          >
                           {emoji}
                         </Button>
                       ))}
                    </div>
                 </PopoverContent>
               </Popover>

              <Button 
                onClick={handleAddComment} 
                disabled={isSubmitting || !newComment.trim()}
                size="sm"
                className="gap-2"
              >
                {isSubmitting ? (
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> 
                ) : (
                  <Send className="h-4 w-4" />
                )}
                 Post
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-muted p-4 rounded-lg text-center border border-dashed">
          <User className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">Login to join the conversation</p>
          {/* Consider linking to auth page */} 
          <Button variant="outline" size="sm" onClick={() => { /* navigate('/auth') ? */ }}>Login</Button>
        </div>
      )}
      
      {/* Comments List Section */}
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">
          {/* Simple loading skeleton for comments */}
          {[...Array(3)].map((_, i) => (
             <div key={i} className="flex gap-3 items-start mb-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted"></div>
                <div className="flex-1 space-y-2">
                   <div className="h-4 bg-muted rounded w-1/4"></div>
                   <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
             </div>
          ))}
          <p className="mt-4 text-sm">Loading comments...</p>
        </div>
      ) : sortedComments.length > 0 ? (
        <div className="space-y-5 mt-6">
          {sortedComments.map((comment) => (
            <div key={comment.id} className="flex gap-3 items-start">
              <Avatar className={`h-10 w-10 ${comment.is_event_creator ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
                <AvatarImage src={comment.user_avatar_url || undefined} alt={comment.user_name} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {(comment.user_name || 'A').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-background rounded-md pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.user_name || 'Anonymous User'}</span>
                  {comment.is_event_creator && (
                    <Badge variant="outline" className="text-xs h-5 border-primary/50 text-primary bg-primary/10">Organizer</Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                     {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                {/* Use whitespace-pre-wrap to respect newlines in comments */}
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm">No comments yet.</p>
           {user && <p className="text-sm">Be the first to share your thoughts!</p>} 
        </div>
      )}
    </div>
  );
};
