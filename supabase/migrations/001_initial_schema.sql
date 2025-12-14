-- My Sobriety App - Initial Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & PROFILES
-- ============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    timezone TEXT DEFAULT 'UTC',
    is_anonymous BOOLEAN DEFAULT FALSE,
    community_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_check_in BOOLEAN DEFAULT TRUE,
    notification_milestones BOOLEAN DEFAULT TRUE,
    notification_community BOOLEAN DEFAULT TRUE,
    notification_motivational BOOLEAN DEFAULT TRUE,
    check_in_times JSONB DEFAULT '["09:00", "21:00"]'::jsonb,
    theme_preference TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- SOBRIETY TRACKING
-- ============================================

-- Sobriety records
CREATE TABLE IF NOT EXISTS public.sobriety_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    substance_type TEXT NOT NULL CHECK (substance_type IN ('alcohol', 'drugs', 'gambling', 'custom')),
    custom_label TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones achieved
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sobriety_record_id UUID NOT NULL REFERENCES public.sobriety_records(id) ON DELETE CASCADE,
    milestone_type TEXT NOT NULL,
    achieved_at TIMESTAMPTZ NOT NULL,
    celebrated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DAILY CHECK-INS
-- ============================================

CREATE TABLE IF NOT EXISTS public.check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_in_time TIME NOT NULL,
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    craving_level INTEGER CHECK (craving_level >= 0 AND craving_level <= 10),
    notes TEXT,
    is_sober BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, check_in_date, check_in_time)
);

-- ============================================
-- EMERGENCY RESOURCES
-- ============================================

CREATE TABLE IF NOT EXISTS public.emergency_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    phone_number TEXT,
    website_url TEXT,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('hotline', 'treatment_center', 'support_group', 'crisis_line')),
    coverage_level TEXT NOT NULL CHECK (coverage_level IN ('national', 'regional', 'local')),
    country_code TEXT DEFAULT 'US',
    region TEXT,
    city TEXT,
    is_24_hours BOOLEAN DEFAULT FALSE,
    languages TEXT[] DEFAULT ARRAY['en'],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal emergency contacts
CREATE TABLE IF NOT EXISTS public.personal_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT,
    phone_number TEXT NOT NULL,
    email TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BRANDING / THEMING
-- ============================================

CREATE TABLE IF NOT EXISTS public.branding_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_color TEXT DEFAULT '#4F46E5',
    secondary_color TEXT DEFAULT '#10B981',
    accent_color TEXT DEFAULT '#F59E0B',
    logo_url TEXT,
    app_name TEXT DEFAULT 'My Sobriety',
    tagline TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sobriety_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding_config ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User settings policies
CREATE POLICY "Users can manage own settings" ON public.user_settings
    FOR ALL USING (auth.uid() = user_id);

-- Sobriety records policies
CREATE POLICY "Users can manage own sobriety records" ON public.sobriety_records
    FOR ALL USING (auth.uid() = user_id);

-- Milestones policies
CREATE POLICY "Users can manage own milestones" ON public.milestones
    FOR ALL USING (auth.uid() = user_id);

-- Check-ins policies
CREATE POLICY "Users can manage own check-ins" ON public.check_ins
    FOR ALL USING (auth.uid() = user_id);

-- Personal contacts policies
CREATE POLICY "Users can manage own emergency contacts" ON public.personal_emergency_contacts
    FOR ALL USING (auth.uid() = user_id);

-- Emergency resources are public read
CREATE POLICY "Anyone can read emergency resources" ON public.emergency_resources
    FOR SELECT USING (is_active = TRUE);

-- Branding config is public read
CREATE POLICY "Anyone can read branding config" ON public.branding_config
    FOR SELECT USING (is_active = TRUE);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sobriety_records_user ON public.sobriety_records(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_date ON public.check_ins(user_id, check_in_date);
CREATE INDEX IF NOT EXISTS idx_milestones_user ON public.milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_resources_coverage ON public.emergency_resources(coverage_level, country_code);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sobriety_records_updated_at
    BEFORE UPDATE ON public.sobriety_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA - Emergency Resources
-- ============================================

INSERT INTO public.emergency_resources (name, description, phone_number, resource_type, coverage_level, is_24_hours, languages) VALUES
('SAMHSA National Helpline', 'Free, confidential, 24/7 treatment referral and information service', '1-800-662-4357', 'hotline', 'national', TRUE, ARRAY['en', 'es']),
('National Suicide Prevention Lifeline', 'Free and confidential support for people in distress', '988', 'crisis_line', 'national', TRUE, ARRAY['en', 'es']),
('Crisis Text Line', 'Free crisis support via text message - Text HOME to 741741', '741741', 'crisis_line', 'national', TRUE, ARRAY['en']),
('Alcoholics Anonymous', 'AA meeting information and support', '1-800-839-1686', 'support_group', 'national', TRUE, ARRAY['en'])
ON CONFLICT DO NOTHING;

-- Insert default branding config
INSERT INTO public.branding_config (app_name, tagline, primary_color, secondary_color, accent_color, is_active) VALUES
('My Sobriety', 'Your journey to recovery starts here', '#4F46E5', '#10B981', '#F59E0B', TRUE)
ON CONFLICT DO NOTHING;
