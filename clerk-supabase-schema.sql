-- Clerk + Supabase Integration Schema
-- This creates the profiles table and RLS policies for Clerk users

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, -- Clerk User ID
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    
    -- Clerk specific fields
    clerk_session_id TEXT,
    clerk_organization_id TEXT,
    clerk_role TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional fields for Spaecs
    onboarding_complete BOOLEAN DEFAULT FALSE,
    community_name TEXT,
    community_type TEXT,
    member_count INTEGER DEFAULT 0,
    total_xp BIGINT DEFAULT 0,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'inactive',
    waitlist_position INTEGER,
    referral_code TEXT UNIQUE,
    referred_by TEXT REFERENCES public.profiles(id),
    
    -- Preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);
CREATE INDEX IF NOT EXISTS profiles_clerk_organization_id_idx ON public.profiles (clerk_organization_id);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles (created_at);
CREATE INDEX IF NOT EXISTS profiles_referral_code_idx ON public.profiles (referral_code);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for users to own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert access for users to own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update access for users to own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon insert for initial setup" ON public.profiles;

-- Create RLS policies
-- Users can read their own profile
CREATE POLICY "Enable read access for users to own profile" ON public.profiles
    FOR SELECT USING (auth.uid()::text = id);

-- Users can insert their own profile (for initial creation)
CREATE POLICY "Enable insert access for users to own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Users can update their own profile
CREATE POLICY "Enable update access for users to own profile" ON public.profiles
    FOR UPDATE USING (auth.uid()::text = id)
    WITH CHECK (auth.uid()::text = id);

-- Allow anonymous inserts for webhook (using service role key)
-- This is needed for Clerk webhook to create profiles
CREATE POLICY "Allow service role to manage profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Create function to generate referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    -- Generate 8 character code
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to assign waitlist position
CREATE OR REPLACE FUNCTION public.assign_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
    -- Only assign if not already assigned
    IF NEW.waitlist_position IS NULL THEN
        SELECT COUNT(*) + 1 INTO NEW.waitlist_position
        FROM public.profiles
        WHERE created_at < NOW();
    END IF;
    
    -- Generate referral code if not exists
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := public.generate_referral_code();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for waitlist position
DROP TRIGGER IF EXISTS assign_waitlist_position_trigger ON public.profiles;
CREATE TRIGGER assign_waitlist_position_trigger
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE public.assign_waitlist_position();

-- Create view for public waitlist stats
CREATE OR REPLACE VIEW public.waitlist_stats AS
SELECT 
    COUNT(*) as total_waitlist,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as joined_this_week,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as joined_today
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.waitlist_stats TO anon, authenticated;

-- Create table for tracking user activities (for gamification)
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'login', 'invite', 'create_community', etc.
    points_earned INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for user activities
CREATE INDEX IF NOT EXISTS user_activities_user_id_idx ON public.user_activities (user_id);
CREATE INDEX IF NOT EXISTS user_activities_created_at_idx ON public.user_activities (created_at);

-- Enable RLS on user_activities
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Users can read their own activities
CREATE POLICY "Users can read own activities" ON public.user_activities
    FOR SELECT USING (auth.uid()::text = user_id);

-- Service role can manage all activities
CREATE POLICY "Service role can manage activities" ON public.user_activities
    FOR ALL USING (auth.role() = 'service_role');

-- Function to update user's total XP
CREATE OR REPLACE FUNCTION public.update_user_xp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET total_xp = total_xp + NEW.points_earned
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update XP when activity is logged
DROP TRIGGER IF EXISTS update_user_xp_trigger ON public.user_activities;
CREATE TRIGGER update_user_xp_trigger
    AFTER INSERT ON public.user_activities
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_user_xp();