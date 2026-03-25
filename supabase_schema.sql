
-- ==========================================
-- 1. FIX PROFILES TABLE SCHEMA
-- ==========================================

-- Ensure the profiles table has all necessary columns including ROLE
DO $$
BEGIN
    -- Add created_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Ensure updated_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Ensure role exists for dynamic admin assignment
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- ==========================================
-- 2. ROBUST ADMIN CHECK FUNCTION (DYNAMIC)
-- ==========================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
  user_role TEXT;
  user_email TEXT;
BEGIN
  -- Get current User ID
  current_user_id := auth.uid();
  
  -- Get Email (fallback for bootstrapping)
  user_email := LOWER(COALESCE(
    auth.jwt() ->> 'email', 
    current_setting('request.jwt.claims', true)::json->>'email',
    ''
  ));
  
  -- 1. Check Hardcoded Super Admins (Always allow)
  IF user_email IN ('admin@lennox.bank', 'akugbof@gmail.com') THEN
    RETURN TRUE;
  END IF;

  -- 2. Check Database Role
  -- We use a direct query here. Since this function is SECURITY DEFINER, 
  -- it bypasses RLS to check the role of the requesting user.
  SELECT role INTO user_role FROM public.profiles WHERE id = current_user_id;
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==========================================
-- 3. RESET POLICIES
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (is_admin());

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE 
USING (is_admin());

-- ==========================================
-- 4. RE-SYNCHRONIZE DATA
-- ==========================================
-- This script matches Auth users to Profiles and fills in missing created_at dates
INSERT INTO public.profiles (id, full_name, email, created_at, updated_at)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', email, 'New User'), 
    email, 
    created_at, -- Take the real creation date from auth.users
    COALESCE(last_sign_in_at, updated_at, NOW())
FROM auth.users
ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    created_at = COALESCE(public.profiles.created_at, EXCLUDED.created_at),
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);

-- Ensure the Super Admin accounts are confirmed and have role set
UPDATE auth.users SET email_confirmed_at = NOW() 
WHERE email IN ('admin@lennox.bank', 'akugbof@gmail.com');

UPDATE public.profiles SET role = 'admin'
WHERE email IN ('admin@lennox.bank', 'akugbof@gmail.com');

-- Refresh the PostgREST cache
NOTIFY pgrst, 'reload schema';
