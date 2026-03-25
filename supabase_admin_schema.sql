-- ==============================================================================
-- LENNOX BANK: DEBUG & REPAIR SCHEMA
-- ==============================================================================

-- 1. FLUSH TRANSACTIONS TABLE
DROP TABLE IF EXISTS public.transactions CASCADE;

-- 2. CREATE ROBUST TRANSACTIONS TABLE
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,           
  account_id UUID,        
  amount NUMERIC,
  description TEXT,
  type TEXT,              
  category TEXT,
  status TEXT DEFAULT 'Success',
  merchant TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DISABLE RLS
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.transactions TO anon;
GRANT ALL ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;

-- 4. ENSURE NOTIFICATIONS TABLE EXISTS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT,
  message TEXT,
  type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.notifications TO anon;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- 5. APP SETTINGS UPGRADE
CREATE TABLE IF NOT EXISTS public.app_settings (
  id BIGINT PRIMARY KEY DEFAULT 1,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  allow_registration BOOLEAN DEFAULT TRUE,
  max_transaction_limit NUMERIC DEFAULT 50000,
  email_notifications BOOLEAN DEFAULT TRUE,
  disable_transactions BOOLEAN DEFAULT FALSE,
  site_name TEXT DEFAULT 'Lennox Bank'
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read settings" ON public.app_settings;
CREATE POLICY "Allow public read settings" ON public.app_settings FOR SELECT USING (true);

-- 6. REALTIME SETUP
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- 7. FORCE REFRESH
NOTIFY pgrst, 'reload schema';