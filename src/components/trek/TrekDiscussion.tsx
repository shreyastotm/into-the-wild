
import React, { useState } from 'react';
import { MessageSquare, Send, Smile, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/auth/AuthProvider';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  content: string;
  createdAt: string;
  isEventCreator?: boolean;
}

interface TrekDiscussionProps {
  trekId: string;
  comments: Comment[];
  onAddComment?: (content: string) => Promise<boolean>;
  isLoading?: boolean;
}

export const TrekDiscussion: React.FC<TrekDiscussionProps> = ({ 
  trekId,
  comments,
  onAddComment,
  isLoading = false
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
        const success = await onAddComment(newComment);
        if (success) {
          setNewComment('');
        }
      } else {
        // Fallback if no callback provided
        toast({
          title: "Feature coming soon",
          description: "Comments will be enabled soon",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Comment failed",
        description: "Unable to add your comment. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold flex items-center">
        <MessageSquare className="h-5 w-5 mr-2" />
        Discussion ({comments.length})
      </h3>
      
      {user ? (
        <div className="flex gap-4 items-start">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userProfile?.avatar_url || undefined} alt={userProfile?.full_name || 'User'} />
            <AvatarFallback className="bg-primary/10">
              {userProfile?.full_name ? userProfile.full_name.substring(0, 2).toUpperCase() : 
                user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Share your thoughts or ask questions about this trek..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-24 mb-2"
              disabled={isSubmitting}
            />
            <div className="flex justify-between">
              <Button variant="outline" size="icon" type="button">
                <Smile className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleAddComment} 
                disabled={isSubmitting || !newComment.trim() || isLoading}
                className="gap-2"
              >
                {isSubmitting ? 'Posting...' : (
                  <>
                    <Send className="h-4 w-4" /> Post Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-muted p-4 rounded-lg text-center">
          <User className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">Login to join the conversation</p>
          <Button variant="outline" size="sm">Login</Button>
        </div>
      )}
      
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-muted-foreground/20 mb-2"></div>
            <div className="h-4 w-32 bg-muted-foreground/20 rounded mb-1"></div>
            <div className="h-3 w-24 bg-muted-foreground/10 rounded"></div>
          </div>
          <p className="mt-4">Loading comments...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4 mt-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar className={`h-10 w-10 ${comment.isEventCreator ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                <AvatarImage src={comment.userAvatar || undefined} alt={comment.userName} />
                <AvatarFallback className="bg-primary/10">
                  {comment.userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{comment.userName}</span>
                  {comment.isEventCreator && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Organizer</span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};
