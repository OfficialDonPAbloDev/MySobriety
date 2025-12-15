import { supabase } from '../../../config/supabase';

export type PostCategory =
  | 'general'
  | 'support'
  | 'celebration'
  | 'question'
  | 'motivation';

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  category: PostCategory;
  is_anonymous: boolean;
  encouragement_count: number;
  comment_count: number;
  is_flagged: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  author_name?: string;
  author_days_sober?: number;
  user_has_liked?: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  likes_count: number;
  is_hidden: boolean;
  created_at: string;
  // Joined fields
  author_name?: string;
  author_days_sober?: number;
}

export interface Encouragement {
  id: string;
  from_user_id: string;
  to_user_id: string;
  post_id: string | null;
  comment_id: string | null;
  message: string;
  created_at: string;
}

export interface CreatePostInput {
  content: string;
  category: PostCategory;
  is_anonymous?: boolean;
}

export interface CreateCommentInput {
  post_id: string;
  content: string;
  is_anonymous?: boolean;
}

export const POST_CATEGORIES: { value: PostCategory; label: string; icon: string; description: string }[] = [
  {
    value: 'general',
    label: 'General',
    icon: '💬',
    description: 'General discussions and conversations',
  },
  {
    value: 'support',
    label: 'Support',
    icon: '🤝',
    description: 'Ask for help or offer support to others',
  },
  {
    value: 'celebration',
    label: 'Celebration',
    icon: '🎉',
    description: 'Share your wins and achievements',
  },
  {
    value: 'question',
    label: 'Question',
    icon: '❓',
    description: 'Ask questions to the community',
  },
  {
    value: 'motivation',
    label: 'Motivation',
    icon: '💪',
    description: 'Share or find motivational content',
  },
];

export const ENCOURAGEMENT_MESSAGES = [
  "You've got this! 💪",
  "One day at a time. You're doing great!",
  "Proud of you for sharing. Keep going!",
  "Your strength inspires me!",
  "Thank you for being part of this community!",
  "Every step forward counts!",
  "You're not alone in this journey.",
  "Sending positive vibes your way!",
];

class CommunityService {
  /**
   * Get community posts with pagination
   */
  async getPosts(
    category?: PostCategory,
    limit = 20,
    offset = 0
  ): Promise<CommunityPost[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from('community_posts')
      .select(`
        *,
        profiles (display_name)
      `)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    // Get user's likes if authenticated
    let userLikes: Set<string> = new Set();
    if (user) {
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id);
      userLikes = new Set(likes?.map((l) => l.post_id) || []);
    }

    return (data || []).map((post: Record<string, unknown>) => {
      const profiles = post.profiles as { display_name?: string } | null;
      return {
        ...post,
        author_name: post.is_anonymous ? 'Anonymous' : (profiles?.display_name || 'User'),
        author_days_sober: undefined,
        user_has_liked: userLikes.has(post.id as string),
        profiles: undefined,
      };
    }) as CommunityPost[];
  }

  /**
   * Get a single post with its comments
   */
  async getPostWithComments(postId: string): Promise<{
    post: CommunityPost;
    comments: CommunityComment[];
  } | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch post
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles (display_name)
      `)
      .eq('id', postId)
      .single();

    if (postError) {
      console.error('Error fetching post:', postError);
      return null;
    }

    // Fetch comments
    const { data: comments, error: commentsError } = await supabase
      .from('community_comments')
      .select(`
        *,
        profiles (display_name)
      `)
      .eq('post_id', postId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }

    // Check if user has liked the post
    let userHasLiked = false;
    if (user) {
      const { data: like } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();
      userHasLiked = !!like;
    }

    const postProfiles = post.profiles as { display_name?: string } | null;

    return {
      post: {
        ...post,
        author_name: post.is_anonymous ? 'Anonymous' : (postProfiles?.display_name || 'User'),
        author_days_sober: undefined,
        user_has_liked: userHasLiked,
        profiles: undefined,
      } as CommunityPost,
      comments: (comments || []).map((comment: Record<string, unknown>) => {
        const commentProfiles = comment.profiles as { display_name?: string } | null;
        return {
          ...comment,
          author_name: comment.is_anonymous ? 'Anonymous' : (commentProfiles?.display_name || 'User'),
          author_days_sober: undefined,
          profiles: undefined,
        };
      }) as CommunityComment[],
    };
  }

  /**
   * Create a new post
   */
  async createPost(input: CreatePostInput): Promise<CommunityPost> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        content: input.content,
        category: input.category,
        is_anonymous: input.is_anonymous || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }

    return data as CommunityPost;
  }

  /**
   * Update a post
   */
  async updatePost(
    postId: string,
    input: Partial<CreatePostInput>
  ): Promise<CommunityPost> {
    const { data, error } = await supabase
      .from('community_posts')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      throw error;
    }

    return data as CommunityPost;
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<void> {
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  /**
   * Like or unlike a post
   */
  async togglePostLike(postId: string): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      // Unlike
      await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);
      return false;
    } else {
      // Like
      await supabase.from('post_likes').insert({
        post_id: postId,
        user_id: user.id,
      });
      return true;
    }
  }

  /**
   * Add a comment to a post
   */
  async addComment(input: CreateCommentInput): Promise<CommunityComment> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('community_comments')
      .insert({
        post_id: input.post_id,
        user_id: user.id,
        content: input.content,
        is_anonymous: input.is_anonymous || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }

    return data as CommunityComment;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('community_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  /**
   * Send an encouragement to another user
   */
  async sendEncouragement(
    toUserId: string,
    message: string,
    postId?: string,
    commentId?: string
  ): Promise<Encouragement> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('encouragements')
      .insert({
        from_user_id: user.id,
        to_user_id: toUserId,
        post_id: postId || null,
        comment_id: commentId || null,
        message,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending encouragement:', error);
      throw error;
    }

    return data as Encouragement;
  }

  /**
   * Get encouragements received by user
   */
  async getMyEncouragements(): Promise<Encouragement[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('encouragements')
      .select('*')
      .eq('to_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching encouragements:', error);
      throw error;
    }

    return (data as Encouragement[]) || [];
  }

  /**
   * Report content
   */
  async reportContent(
    contentType: 'post' | 'comment',
    contentId: string,
    reason: string
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('content_reports').insert({
      reporter_id: user.id,
      content_type: contentType,
      content_id: contentId,
      reason,
    });

    if (error) {
      console.error('Error reporting content:', error);
      throw error;
    }
  }

  /**
   * Block a user
   */
  async blockUser(blockedUserId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('blocked_users').insert({
      blocker_id: user.id,
      blocked_id: blockedUserId,
    });

    if (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(blockedUserId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', blockedUserId);

    if (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  }

  /**
   * Get my posts
   */
  async getMyPosts(): Promise<CommunityPost[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my posts:', error);
      throw error;
    }

    return (data as CommunityPost[]) || [];
  }
}

export const communityService = new CommunityService();
