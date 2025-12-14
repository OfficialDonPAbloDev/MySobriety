import { useState, useEffect, useCallback } from 'react';
import {
  communityService,
  CommunityPost,
  CommunityComment,
  PostCategory,
  CreatePostInput,
  CreateCommentInput,
} from '../services/communityService';

interface UseCommunityReturn {
  posts: CommunityPost[];
  isLoading: boolean;
  error: Error | null;
  selectedCategory: PostCategory | null;
  setSelectedCategory: (category: PostCategory | null) => void;
  createPost: (input: CreatePostInput) => Promise<CommunityPost>;
  deletePost: (postId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

export function useCommunity(): UseCommunityReturn {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const newOffset = reset ? 0 : offset;
      const fetchedPosts = await communityService.getPosts(
        selectedCategory || undefined,
        PAGE_SIZE,
        newOffset
      );

      if (reset) {
        setPosts(fetchedPosts);
        setOffset(fetchedPosts.length);
      } else {
        setPosts((prev) => [...prev, ...fetchedPosts]);
        setOffset((prev) => prev + fetchedPosts.length);
      }

      setHasMore(fetchedPosts.length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, offset]);

  useEffect(() => {
    fetchPosts(true);
  }, [selectedCategory]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchPosts(false);
  }, [fetchPosts, hasMore, isLoading]);

  const createPost = useCallback(async (input: CreatePostInput): Promise<CommunityPost> => {
    const newPost = await communityService.createPost(input);
    await fetchPosts(true);
    return newPost;
  }, [fetchPosts]);

  const deletePost = useCallback(async (postId: string): Promise<void> => {
    await communityService.deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const toggleLike = useCallback(async (postId: string): Promise<void> => {
    const liked = await communityService.togglePostLike(postId);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              user_has_liked: liked,
              likes_count: p.likes_count + (liked ? 1 : -1),
            }
          : p
      )
    );
  }, []);

  const refresh = useCallback(async () => {
    setOffset(0);
    await fetchPosts(true);
  }, [fetchPosts]);

  return {
    posts,
    isLoading,
    error,
    selectedCategory,
    setSelectedCategory,
    createPost,
    deletePost,
    toggleLike,
    loadMore,
    refresh,
    hasMore,
  };
}

interface UsePostDetailReturn {
  post: CommunityPost | null;
  comments: CommunityComment[];
  isLoading: boolean;
  error: Error | null;
  addComment: (content: string, isAnonymous?: boolean) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  toggleLike: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePostDetail(postId: string | null): UsePostDetailReturn {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPost = useCallback(async () => {
    if (!postId) {
      setPost(null);
      setComments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await communityService.getPostWithComments(postId);
      if (result) {
        setPost(result.post);
        setComments(result.comments);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch post'));
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const addComment = useCallback(
    async (content: string, isAnonymous = false): Promise<void> => {
      if (!postId) return;

      const newComment = await communityService.addComment({
        post_id: postId,
        content,
        is_anonymous: isAnonymous,
      });

      setComments((prev) => [...prev, newComment]);
      setPost((prev) =>
        prev ? { ...prev, comments_count: prev.comments_count + 1 } : prev
      );
    },
    [postId]
  );

  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    await communityService.deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setPost((prev) =>
      prev ? { ...prev, comments_count: prev.comments_count - 1 } : prev
    );
  }, []);

  const toggleLike = useCallback(async (): Promise<void> => {
    if (!postId || !post) return;

    const liked = await communityService.togglePostLike(postId);
    setPost({
      ...post,
      user_has_liked: liked,
      likes_count: post.likes_count + (liked ? 1 : -1),
    });
  }, [postId, post]);

  return {
    post,
    comments,
    isLoading,
    error,
    addComment,
    deleteComment,
    toggleLike,
    refresh: fetchPost,
  };
}
