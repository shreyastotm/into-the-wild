import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MessageSquare, Pin, Lock, Send, Loader2, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ForumThread {
  id: number;
  category_id: number;
  author_id: string;
  title: string;
  locked: boolean;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  category_name?: string;
  author_name?: string;
  author_avatar?: string;
}

interface ForumPost {
  id: number;
  thread_id: number;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  author_name?: string;
  author_avatar?: string;
}

export default function ForumThread() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    if (id) {
      fetchThreadData();
    }
  }, [id]);

  const fetchThreadData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Fetch thread with category and author info
      const { data: threadData, error: threadError } = await supabase
        .from('forum_threads')
        .select(`
          id,
          category_id,
          author_id,
          title,
          locked,
          pinned,
          created_at,
          updated_at,
          forum_categories!forum_threads_category_id_fkey (
            name
          ),
          users!forum_threads_author_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (threadError) {
        console.error('Error fetching thread:', threadError);
        toast({
          title: "Error",
          description: "Thread not found.",
          variant: "destructive",
        });
        navigate('/forum');
        return;
      }

      // Fetch posts in this thread
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          id,
          thread_id,
          author_id,
          content,
          created_at,
          updated_at,
          deleted_at,
          users!forum_posts_author_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('thread_id', id)
        .is('deleted_at', null)
        .order('created_at');

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        toast({
          title: "Error",
          description: "Could not load posts.",
          variant: "destructive",
        });
        return;
      }

      // Transform data
      const transformedThread = {
        ...threadData,
        category_name: threadData.forum_categories?.name || 'Unknown Category',
        author_name: threadData.users?.full_name || 'Unknown User',
        author_avatar: threadData.users?.avatar_url || null,
      };

      const transformedPosts = postsData?.map(post => ({
        ...post,
        author_name: post.users?.full_name || 'Unknown User',
        author_avatar: post.users?.avatar_url || null,
      })) || [];

      setThread(transformedThread);
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching thread data:', error);
      toast({
        title: "Error",
        description: "Could not load thread data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!user || !id || !replyContent.trim()) return;

    try {
      setReplying(true);

      // Use the new rate-limited function
      const { error } = await supabase.rpc('create_forum_post', {
        p_thread_id: parseInt(id),
        p_content: replyContent.trim()
      });

      if (error) {
        console.error('Error creating reply:', error);
        toast({
          title: "Error",
          description: error.message || "Could not post reply. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setReplyContent('');
      toast({
        title: "Reply Posted",
        description: "Your reply has been posted successfully!",
        variant: "default",
      });

      // Refresh posts
      fetchThreadData();
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: "Error",
        description: "Could not post reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setReplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-lg">Loading thread...</div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-lg text-gray-500">Thread not found.</div>
          <Button asChild className="mt-4">
            <Link to="/forum">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forum
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/forum">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forum
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {thread.pinned && (
                    <Badge variant="secondary" className="text-xs">
                      <Pin className="h-3 w-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                  {thread.locked && (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{thread.title}</CardTitle>
                <CardDescription>
                  in {thread.category_name} • Started by {thread.author_name} • {formatDate(thread.created_at)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Posts */}
      <div className="space-y-6 mb-8">
        {posts.map((post, index) => (
          <Card key={post.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author_avatar || undefined} />
                  <AvatarFallback>
                    {post.author_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">{post.author_name}</span>
                    <span className="text-xs text-gray-500">
                      {index === 0 ? 'Original Post' : `Reply`} • {formatDate(post.created_at)}
                    </span>
                    {post.updated_at !== post.created_at && (
                      <span className="text-xs text-gray-500">
                        (edited {formatDate(post.updated_at)})
                      </span>
                    )}
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {posts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-gray-600">
                Be the first to reply to this thread!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reply Section */}
      {user && !thread.locked && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Reply to Thread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts, experiences, or questions..."
                rows={6}
                maxLength={5000}
                className="resize-none"
              />

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {replyContent.length}/5000 characters
                </div>

                <Button
                  onClick={handleReply}
                  disabled={!replyContent.trim() || replying}
                  className="min-w-24"
                >
                  {replying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Post Reply
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {thread.locked && (
        <Card>
          <CardContent className="text-center py-8">
            <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Thread Locked</h3>
            <p className="text-gray-600">
              This thread has been locked and is no longer accepting new replies.
            </p>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Join the Conversation</h3>
            <p className="text-gray-600 mb-4">
              Sign in to reply to this thread and participate in the discussion.
            </p>
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
