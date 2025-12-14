-- Fix check_ins and sobriety_records tables to match application requirements
-- Run this migration in Supabase SQL Editor

-- ============================================
-- FIX SOBRIETY_RECORDS TABLE
-- ============================================

-- 1. Update substance_type constraint to include 'general'
ALTER TABLE public.sobriety_records DROP CONSTRAINT IF EXISTS sobriety_records_substance_type_check;
ALTER TABLE public.sobriety_records ADD CONSTRAINT sobriety_records_substance_type_check
    CHECK (substance_type IN ('alcohol', 'drugs', 'gambling', 'custom', 'general'));

-- 2. Fix foreign key to reference auth.users instead of profiles
ALTER TABLE public.sobriety_records DROP CONSTRAINT IF EXISTS sobriety_records_user_id_fkey;
ALTER TABLE public.sobriety_records
    ADD CONSTRAINT sobriety_records_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- FIX CHECK_INS TABLE
-- ============================================

-- 1. Drop the existing foreign key constraint to profiles table
ALTER TABLE public.check_ins DROP CONSTRAINT IF EXISTS check_ins_user_id_fkey;

-- 2. Add new foreign key constraint to auth.users directly (like other tables in phase 3)
ALTER TABLE public.check_ins
    ADD CONSTRAINT check_ins_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Drop the unique constraint that includes check_in_time
ALTER TABLE public.check_ins DROP CONSTRAINT IF EXISTS check_ins_user_id_check_in_date_check_in_time_key;

-- 4. Make check_in_time optional (nullable)
ALTER TABLE public.check_ins ALTER COLUMN check_in_time DROP NOT NULL;

-- 5. Update mood_rating constraint to allow 1-5 range (app uses 5-point scale)
ALTER TABLE public.check_ins DROP CONSTRAINT IF EXISTS check_ins_mood_rating_check;
ALTER TABLE public.check_ins ADD CONSTRAINT check_ins_mood_rating_check CHECK (mood_rating >= 1 AND mood_rating <= 5);

-- 6. Add missing columns for triggers and coping strategies
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS triggers TEXT[];
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS coping_strategies_used TEXT[];
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 7. Add unique constraint on user_id and check_in_date only (one check-in per day)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_ins_user_id_check_in_date_key'
    ) THEN
        ALTER TABLE public.check_ins ADD CONSTRAINT check_ins_user_id_check_in_date_key UNIQUE (user_id, check_in_date);
    END IF;
END $$;

-- 8. Add trigger for updated_at (only if it doesn't exist)
DROP TRIGGER IF EXISTS update_check_ins_updated_at ON public.check_ins;
CREATE TRIGGER update_check_ins_updated_at
    BEFORE UPDATE ON public.check_ins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
