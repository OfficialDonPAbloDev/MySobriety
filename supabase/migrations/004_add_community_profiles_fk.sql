-- Add foreign key relationships from community tables to profiles
-- This allows Supabase/PostgREST to join community_posts and community_comments with profiles

-- Add FK from community_posts to profiles
ALTER TABLE public.community_posts
    ADD CONSTRAINT community_posts_user_id_profiles_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add FK from community_comments to profiles
ALTER TABLE public.community_comments
    ADD CONSTRAINT community_comments_user_id_profiles_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add policy to allow authenticated users to view profiles for community features
-- (needed to join profiles in community queries)
CREATE POLICY "Authenticated users can view profiles for community"
    ON public.profiles FOR SELECT
    USING (auth.role() = 'authenticated');
