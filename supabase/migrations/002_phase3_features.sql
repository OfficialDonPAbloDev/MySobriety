-- Phase 3: Journal, Goals, Triggers, and Community Forum
-- Run this migration in Supabase SQL Editor

-- ============================================
-- JOURNAL ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
    tags TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT false,
    entry_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for journal entries (private to user)
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal entries"
    ON public.journal_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journal entries"
    ON public.journal_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
    ON public.journal_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
    ON public.journal_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_journal_entries_user_date ON public.journal_entries(user_id, entry_date DESC);
CREATE INDEX idx_journal_entries_tags ON public.journal_entries USING GIN(tags);

-- ============================================
-- GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('health', 'relationships', 'career', 'personal', 'financial', 'recovery', 'other')),
    target_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- RLS for goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
    ON public.goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
    ON public.goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
    ON public.goals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
    ON public.goals FOR DELETE
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_goals_user_status ON public.goals(user_id, status);

-- ============================================
-- GOAL STEPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.goal_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for goal steps
ALTER TABLE public.goal_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goal steps"
    ON public.goal_steps FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goal steps"
    ON public.goal_steps FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goal steps"
    ON public.goal_steps FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goal steps"
    ON public.goal_steps FOR DELETE
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_goal_steps_goal ON public.goal_steps(goal_id, sort_order);

-- ============================================
-- TRIGGERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.trigger_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('emotional', 'environmental', 'social', 'physical', 'other')),
    trigger_name TEXT NOT NULL,
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
    notes TEXT,
    coping_strategies_used TEXT[] DEFAULT '{}',
    outcome TEXT CHECK (outcome IN ('managed', 'struggled', 'relapsed')),
    location TEXT,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for trigger logs
ALTER TABLE public.trigger_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trigger logs"
    ON public.trigger_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own trigger logs"
    ON public.trigger_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trigger logs"
    ON public.trigger_logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trigger logs"
    ON public.trigger_logs FOR DELETE
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_trigger_logs_user_date ON public.trigger_logs(user_id, triggered_at DESC);
CREATE INDEX idx_trigger_logs_type ON public.trigger_logs(user_id, trigger_type);

-- ============================================
-- COPING STRATEGIES TABLE (system + user-defined)
-- ============================================
CREATE TABLE IF NOT EXISTS public.coping_strategies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for system strategies
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('physical', 'mental', 'social', 'creative', 'spiritual', 'practical')),
    is_system BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for coping strategies
ALTER TABLE public.coping_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view system and own coping strategies"
    ON public.coping_strategies FOR SELECT
    USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own coping strategies"
    ON public.coping_strategies FOR INSERT
    WITH CHECK (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can update own coping strategies"
    ON public.coping_strategies FOR UPDATE
    USING (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can delete own coping strategies"
    ON public.coping_strategies FOR DELETE
    USING (auth.uid() = user_id AND is_system = false);

-- ============================================
-- COMMUNITY POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('support', 'celebration', 'question', 'motivation', 'general')),
    is_anonymous BOOLEAN DEFAULT false,
    encouragement_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_flagged BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for community posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view non-hidden posts"
    ON public.community_posts FOR SELECT
    USING (auth.role() = 'authenticated' AND is_hidden = false);

CREATE POLICY "Users can create posts"
    ON public.community_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
    ON public.community_posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
    ON public.community_posts FOR DELETE
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_community_posts_category ON public.community_posts(category, created_at DESC);
CREATE INDEX idx_community_posts_user ON public.community_posts(user_id, created_at DESC);

-- ============================================
-- COMMUNITY COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    is_flagged BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for comments
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view non-hidden comments"
    ON public.community_comments FOR SELECT
    USING (auth.role() = 'authenticated' AND is_hidden = false);

CREATE POLICY "Users can create comments"
    ON public.community_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
    ON public.community_comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
    ON public.community_comments FOR DELETE
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_community_comments_post ON public.community_comments(post_id, created_at);

-- ============================================
-- ENCOURAGEMENTS TABLE (reactions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.encouragements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- RLS for encouragements
ALTER TABLE public.encouragements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view encouragements"
    ON public.encouragements FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can add encouragement"
    ON public.encouragements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own encouragement"
    ON public.encouragements FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- CONTENT REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.content_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'harmful', 'inappropriate', 'misinformation', 'other')),
    details TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

-- RLS for reports
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
    ON public.content_reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- ============================================
-- BLOCKED USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.blocked_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    blocked_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, blocked_user_id)
);

-- RLS for blocked users
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocks"
    ON public.blocked_users FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can block others"
    ON public.blocked_users FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unblock"
    ON public.blocked_users FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA: System Coping Strategies
-- ============================================
INSERT INTO public.coping_strategies (name, description, category, is_system) VALUES
    ('Deep Breathing', 'Take slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 4.', 'mental', true),
    ('Go for a Walk', 'Get outside and take a walk, even if just for 10 minutes.', 'physical', true),
    ('Call Your Sponsor', 'Reach out to your sponsor or accountability partner.', 'social', true),
    ('Attend a Meeting', 'Go to an AA, NA, or other support group meeting.', 'social', true),
    ('Exercise', 'Do any physical activity - run, gym, yoga, or dancing.', 'physical', true),
    ('Journal Your Feelings', 'Write down what you''re feeling without judgment.', 'mental', true),
    ('Practice Gratitude', 'List 3 things you''re grateful for right now.', 'mental', true),
    ('Cold Water', 'Splash cold water on your face or hold ice cubes.', 'physical', true),
    ('5-4-3-2-1 Grounding', 'Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.', 'mental', true),
    ('Listen to Music', 'Put on music that calms you or lifts your mood.', 'creative', true),
    ('Reach Out to a Friend', 'Text or call someone you trust.', 'social', true),
    ('Meditation', 'Use a guided meditation app or sit quietly for 5-10 minutes.', 'spiritual', true),
    ('Eat Something Healthy', 'Have a nutritious snack - hunger can trigger cravings.', 'practical', true),
    ('Take a Shower', 'A hot or cold shower can reset your nervous system.', 'physical', true),
    ('Read Recovery Literature', 'Read from the Big Book, daily reflection, or recovery blog.', 'spiritual', true),
    ('Play the Tape Forward', 'Imagine how you''ll feel tomorrow if you use vs stay sober.', 'mental', true),
    ('Creative Activity', 'Draw, paint, play music, or work on a craft project.', 'creative', true),
    ('Prayer', 'Pray or connect with your higher power.', 'spiritual', true),
    ('HALT Check', 'Ask yourself: Am I Hungry, Angry, Lonely, or Tired?', 'practical', true),
    ('Distraction Activity', 'Watch a show, play a game, or do a puzzle.', 'practical', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTIONS: Update comment/encouragement counts
-- ============================================
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_posts
        SET comment_count = comment_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_posts
        SET comment_count = comment_count - 1
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_change
    AFTER INSERT OR DELETE ON public.community_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

CREATE OR REPLACE FUNCTION update_post_encouragement_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_posts
        SET encouragement_count = encouragement_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_posts
        SET encouragement_count = encouragement_count - 1
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_encouragement_change
    AFTER INSERT OR DELETE ON public.encouragements
    FOR EACH ROW EXECUTE FUNCTION update_post_encouragement_count();

-- ============================================
-- AUTO-UPDATE timestamps
-- ============================================
CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
