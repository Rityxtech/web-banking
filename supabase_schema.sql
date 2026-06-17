-- ============================================================
--  VELTRIX BANK — COMPLETE UNIFIED SUPABASE SCHEMA
--  Generated: Full audit of all frontend + admin components
--  Run this in Supabase SQL Editor to set up the database
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. APP SETTINGS  (Global config: maintenance, limits, branding)
--    Used by: App.tsx, AdminDashboard.tsx, mvpService.ts
-- ============================================================
CREATE TABLE IF NOT EXISTS mvp_app_settings (
    id SERIAL PRIMARY KEY,
    maintenance_mode INTEGER DEFAULT 0,
    allow_registration INTEGER DEFAULT 1,
    max_transaction_limit DECIMAL(15,2) DEFAULT 50000.00,
    -- Extended settings (prevent AdminDashboard "settings upgrade" workaround)
    disable_transactions INTEGER DEFAULT 0,
    email_notifications INTEGER DEFAULT 1,
    site_name VARCHAR(255) DEFAULT 'Veltrix Bank',
    site_logo TEXT,
    site_url TEXT,
    enable_daily_limit INTEGER DEFAULT 0,
    enable_weekly_limit INTEGER DEFAULT 0,
    enable_monthly_limit INTEGER DEFAULT 0,
    -- Legacy single-tier limits (backward compat = Tier 2 defaults)
    daily_limit DECIMAL(15,2) DEFAULT 50000.00,
    weekly_limit DECIMAL(15,2) DEFAULT 250000.00,
    monthly_limit DECIMAL(15,2) DEFAULT 500000.00,
    -- Per-KYC-tier limits
    tier0_daily_limit DECIMAL(15,2) DEFAULT 0.00,
    tier0_weekly_limit DECIMAL(15,2) DEFAULT 0.00,
    tier0_monthly_limit DECIMAL(15,2) DEFAULT 0.00,
    tier1_daily_limit DECIMAL(15,2) DEFAULT 1000.00,
    tier1_weekly_limit DECIMAL(15,2) DEFAULT 5000.00,
    tier1_monthly_limit DECIMAL(15,2) DEFAULT 10000.00,
    tier2_daily_limit DECIMAL(15,2) DEFAULT 50000.00,
    tier2_weekly_limit DECIMAL(15,2) DEFAULT 250000.00,
    tier2_monthly_limit DECIMAL(15,2) DEFAULT 500000.00,
    default_transfer_status VARCHAR(50) DEFAULT 'Success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrations for existing databases (run before seed inserts)
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS site_url TEXT;
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS site_logo TEXT;
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS enable_daily_limit INTEGER DEFAULT 0;
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS enable_weekly_limit INTEGER DEFAULT 0;
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS enable_monthly_limit INTEGER DEFAULT 0;
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS daily_limit DECIMAL(15,2) DEFAULT 50000.00;
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS weekly_limit DECIMAL(15,2) DEFAULT 250000.00;
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS monthly_limit DECIMAL(15,2) DEFAULT 500000.00;
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS default_transfer_status VARCHAR(50) DEFAULT 'Success';
-- Per-KYC-tier limit migrations
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS tier0_daily_limit DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS tier0_weekly_limit DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS tier0_monthly_limit DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS tier1_daily_limit DECIMAL(15,2) DEFAULT 1000.00;
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS tier1_weekly_limit DECIMAL(15,2) DEFAULT 5000.00;
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS tier1_monthly_limit DECIMAL(15,2) DEFAULT 10000.00;
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS tier2_daily_limit DECIMAL(15,2) DEFAULT 50000.00;
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS tier2_weekly_limit DECIMAL(15,2) DEFAULT 250000.00;
ALTER TABLE mvp_app_settings ADD COLUMN IF NOT EXISTS tier2_monthly_limit DECIMAL(15,2) DEFAULT 500000.00;

-- ============================================================
-- 2. WAITLIST  (Public signup queue)
--    Used by: Auth.tsx (direct Supabase), HomePage.tsx
-- ============================================================
CREATE TABLE IF NOT EXISTS mvp_waitlist (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. PROFILES  (Per-user identity, KYC, preferences)
--    Used by: App.tsx, AdminDashboard.tsx, Settings.tsx,
--             Profile.tsx, KycVerification.tsx, Auth.tsx
-- ============================================================
CREATE TABLE IF NOT EXISTS mvp_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    email VARCHAR(255),
    avatar_url TEXT,
    pin VARCHAR(6),
    -- Admin / role system
    role VARCHAR(20) DEFAULT 'user',
    is_admin BOOLEAN DEFAULT FALSE,
    -- KYC & compliance
    kyc_level INTEGER DEFAULT 0,
    kyc_documents JSONB DEFAULT '{}',
    -- Account status
    is_suspended BOOLEAN DEFAULT FALSE,
    theme VARCHAR(20) DEFAULT 'light',
    -- Contact info
    phone VARCHAR(50),
    gender VARCHAR(20),
    dob VARCHAR(20),
    occupation VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    zip VARCHAR(20),
    country VARCHAR(100),
    -- Legacy limit columns (currently calculated client-side, kept for future)
    balance DECIMAL(15,2) DEFAULT 0.00,
    daily_limit DECIMAL(15,2) DEFAULT 1000.00,
    weekly_limit DECIMAL(15,2) DEFAULT 5000.00,
    monthly_limit DECIMAL(15,2) DEFAULT 20000.00,
    daily_usage DECIMAL(15,2) DEFAULT 0.00,
    weekly_usage DECIMAL(15,2) DEFAULT 0.00,
    monthly_usage DECIMAL(15,2) DEFAULT 0.00,
    -- JSON blobs
    settings JSONB DEFAULT '{}',
    card_controls JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================
-- 4. ACCOUNTS  (Checking, Savings, Investment wallets)
--    Used by: App.tsx, Accounts.tsx, Transfers.tsx,
--             TopUp.tsx, AdminDashboard.tsx
-- ============================================================
CREATE TABLE IF NOT EXISTS mvp_accounts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'Checking',
    balance DECIMAL(15,2) DEFAULT 0.00,
    account_number VARCHAR(20) UNIQUE,
    color VARCHAR(20) DEFAULT 'bg-blue-600',
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 5. TRANSACTIONS  (All money movement + admin manual entries)
--    Used by: App.tsx, Accounts.tsx, Transactions.tsx,
--             AdminDashboard.tsx, Investments.tsx
-- ============================================================
CREATE TABLE IF NOT EXISTS mvp_transactions (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE DEFAULT uuid_generate_v4()::text,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES mvp_accounts(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    type VARCHAR(50) DEFAULT 'Deposit',
    category VARCHAR(100),
    merchant VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Success',
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 6. CARDS  (Virtual / physical debit cards)
--    Used by: App.tsx, TopUp.tsx, AdminDashboard.tsx
-- ============================================================
CREATE TABLE IF NOT EXISTS mvp_cards (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'VISA',
    number VARCHAR(20) NOT NULL,
    holder VARCHAR(255),
    expiry VARCHAR(10),
    gradient TEXT,
    shadow TEXT,
    is_frozen BOOLEAN DEFAULT FALSE,
    pin VARCHAR(6),
    cvv VARCHAR(4),
    is_default BOOLEAN DEFAULT FALSE,
    balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7. LOANS  (Loan products)
--    NOTE: Loans.tsx component exists but is not currently
--    wired into App.tsx. Table kept for future integration.
-- ============================================================
CREATE TABLE IF NOT EXISTS mvp_loans (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(100),
    balance DECIMAL(15,2) NOT NULL,
    original DECIMAL(15,2) NOT NULL,
    rate DECIMAL(5,2) DEFAULT 0.00,
    next_payment DATE,
    amount DECIMAL(15,2) DEFAULT 0.00,
    progress DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Current',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 8. ASSETS  (Investment / stock holdings)
--    Used by: App.tsx, Investments.tsx, AdminDashboard.tsx
-- ============================================================
CREATE TABLE IF NOT EXISTS mvp_assets (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    shares DECIMAL(15,8) NOT NULL,
    growth DECIMAL(7,2) DEFAULT 0.00,
    is_positive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 9. NOTIFICATIONS  (User in-app alerts)
--    Used by: App.tsx, Settings.tsx, AdminDashboard.tsx
-- ============================================================
CREATE TABLE IF NOT EXISTS mvp_notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(20) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 10. MESSAGES  (AI chat + live support thread)
--    Used by: App.tsx, AiAssistant.tsx, Support.tsx, AdminDashboard.tsx
-- ============================================================
CREATE TABLE IF NOT EXISTS mvp_messages (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ticket_id INTEGER,
    text TEXT NOT NULL,
    sender VARCHAR(20) DEFAULT 'user',
    is_read BOOLEAN DEFAULT FALSE,
    client_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 11. SUPPORT TICKETS  (User-submitted support requests)
--    Used by: App.tsx, Support.tsx, AdminDashboard.tsx
-- ============================================================
CREATE TABLE IF NOT EXISTS mvp_support_tickets (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Open',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 12. BANKS  (External bank list for wire transfers)
--    Used by: Transfers.tsx, AdminDashboard.tsx
-- ============================================================
CREATE TABLE IF NOT EXISTS mvp_banks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo TEXT,
    color VARCHAR(50) DEFAULT 'bg-slate-500',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deduplicate: keep only the oldest row per bank name
DELETE FROM mvp_banks a USING mvp_banks b
WHERE a.id > b.id AND a.name = b.name;

-- Ensure unique bank names so seed INSERTs are truly idempotent
CREATE UNIQUE INDEX IF NOT EXISTS idx_mvp_banks_name ON mvp_banks(name);

-- Seed default banks (PayPal & Wise)
INSERT INTO mvp_banks (name, logo, color)
VALUES
    ('PayPal', 'https://upload.wikimedia.org/wikipedia/commons/b/b7/PayPal_Logo_Icon_2014.svg', 'bg-blue-600'),
    ('Wise', 'https://wise.com/public-resources/assets/logos/wise-logo.svg', 'bg-green-700')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON mvp_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON mvp_profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON mvp_profiles(role);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON mvp_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON mvp_accounts(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON mvp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON mvp_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON mvp_transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON mvp_transactions(status);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON mvp_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON mvp_loans(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON mvp_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_symbol ON mvp_assets(symbol);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON mvp_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON mvp_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON mvp_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON mvp_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON mvp_support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON mvp_support_tickets(status);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE mvp_app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_banks ENABLE ROW LEVEL SECURITY;

-- Helper: drop any legacy policies from old schema
DROP POLICY IF EXISTS "Allow read access to app_settings" ON mvp_app_settings;
DROP POLICY IF EXISTS "Allow insert to waitlist" ON mvp_waitlist;
DROP POLICY IF EXISTS "Users can view own profile" ON mvp_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON mvp_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON mvp_profiles;
DROP POLICY IF EXISTS "Users can view own accounts" ON mvp_accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON mvp_accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON mvp_accounts;
DROP POLICY IF EXISTS "Users can view own transactions" ON mvp_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON mvp_transactions;
DROP POLICY IF EXISTS "Users can view own cards" ON mvp_cards;
DROP POLICY IF EXISTS "Users can insert own cards" ON mvp_cards;
DROP POLICY IF EXISTS "Users can update own cards" ON mvp_cards;
DROP POLICY IF EXISTS "Users can delete own cards" ON mvp_cards;
DROP POLICY IF EXISTS "Users can view own loans" ON mvp_loans;
DROP POLICY IF EXISTS "Users can insert own loans" ON mvp_loans;
DROP POLICY IF EXISTS "Users can update own loans" ON mvp_loans;
DROP POLICY IF EXISTS "Users can view own assets" ON mvp_assets;
DROP POLICY IF EXISTS "Users can insert own assets" ON mvp_assets;
DROP POLICY IF EXISTS "Users can update own assets" ON mvp_assets;
DROP POLICY IF EXISTS "Users can view own notifications" ON mvp_notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON mvp_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON mvp_notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON mvp_notifications;
DROP POLICY IF EXISTS "Users can view own messages" ON mvp_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON mvp_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON mvp_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON mvp_messages;
DROP POLICY IF EXISTS "Users can view own support_tickets" ON mvp_support_tickets;
DROP POLICY IF EXISTS "Users can insert own support_tickets" ON mvp_support_tickets;
DROP POLICY IF EXISTS "Users can update own support_tickets" ON mvp_support_tickets;
DROP POLICY IF EXISTS "Users can delete own support_tickets" ON mvp_support_tickets;
DROP POLICY IF EXISTS "Allow read all banks" ON mvp_banks;

-- Public tables (no auth required)
CREATE POLICY "Allow read access to app_settings" ON mvp_app_settings FOR SELECT USING (true);
CREATE POLICY "Allow insert to waitlist" ON mvp_waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read all banks" ON mvp_banks FOR SELECT USING (true);

-- User-specific policies
CREATE POLICY "Users can view own profile" ON mvp_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON mvp_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON mvp_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own accounts" ON mvp_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON mvp_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON mvp_accounts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON mvp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON mvp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own cards" ON mvp_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cards" ON mvp_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cards" ON mvp_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cards" ON mvp_cards FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own loans" ON mvp_loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own loans" ON mvp_loans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own loans" ON mvp_loans FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assets" ON mvp_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assets" ON mvp_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assets" ON mvp_assets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON mvp_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON mvp_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON mvp_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON mvp_notifications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON mvp_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON mvp_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own messages" ON mvp_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON mvp_messages FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own support_tickets" ON mvp_support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own support_tickets" ON mvp_support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own support_tickets" ON mvp_support_tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own support_tickets" ON mvp_support_tickets FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- DEFAULT DATA
-- ============================================================

-- Seed default app settings (id=1 is expected by AdminDashboard)
INSERT INTO mvp_app_settings (
    id, maintenance_mode, allow_registration, max_transaction_limit,
    disable_transactions, email_notifications, site_name, site_logo, site_url,
    enable_daily_limit, enable_weekly_limit, enable_monthly_limit,
    daily_limit, weekly_limit, monthly_limit,
    tier0_daily_limit, tier0_weekly_limit, tier0_monthly_limit,
    tier1_daily_limit, tier1_weekly_limit, tier1_monthly_limit,
    tier2_daily_limit, tier2_weekly_limit, tier2_monthly_limit
)
VALUES (
    1, 0, 1, 50000.00,
    0, 1, 'Veltrix Bank', '', '',
    0, 0, 0,
    50000.00, 250000.00, 500000.00,
    0.00, 0.00, 0.00,
    1000.00, 5000.00, 10000.00,
    50000.00, 250000.00, 500000.00
)
ON CONFLICT (id) DO UPDATE SET
    maintenance_mode = EXCLUDED.maintenance_mode,
    allow_registration = EXCLUDED.allow_registration,
    max_transaction_limit = EXCLUDED.max_transaction_limit,
    disable_transactions = EXCLUDED.disable_transactions,
    email_notifications = EXCLUDED.email_notifications,
    site_name = EXCLUDED.site_name,
    site_logo = EXCLUDED.site_logo,
    site_url = EXCLUDED.site_url,
    enable_daily_limit = EXCLUDED.enable_daily_limit,
    enable_weekly_limit = EXCLUDED.enable_weekly_limit,
    enable_monthly_limit = EXCLUDED.enable_monthly_limit,
    daily_limit = EXCLUDED.daily_limit,
    weekly_limit = EXCLUDED.weekly_limit,
    monthly_limit = EXCLUDED.monthly_limit,
    tier0_daily_limit = EXCLUDED.tier0_daily_limit,
    tier0_weekly_limit = EXCLUDED.tier0_weekly_limit,
    tier0_monthly_limit = EXCLUDED.tier0_monthly_limit,
    tier1_daily_limit = EXCLUDED.tier1_daily_limit,
    tier1_weekly_limit = EXCLUDED.tier1_weekly_limit,
    tier1_monthly_limit = EXCLUDED.tier1_monthly_limit,
    tier2_daily_limit = EXCLUDED.tier2_daily_limit,
    tier2_weekly_limit = EXCLUDED.tier2_weekly_limit,
    tier2_monthly_limit = EXCLUDED.tier2_monthly_limit,
    updated_at = NOW();

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Handle new user signup: auto-create profile, checking account, and card
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Create profile
    BEGIN
        INSERT INTO mvp_profiles (
            user_id, full_name, email, role, balance
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
            NEW.email,
            'user',
            2.00
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    END;

    -- 2. Create default checking account
    BEGIN
        INSERT INTO mvp_accounts (user_id, name, type, balance, account_number, is_main)
        VALUES (
            NEW.id,
            'Main Wallet',
            'Checking',
            2.00,
            '****' || UPPER(SUBSTRING(NEW.id::text, 1, 8)),
            TRUE
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create account for user %: %', NEW.id, SQLERRM;
    END;

    -- 3. Create default debit card
    BEGIN
        INSERT INTO mvp_cards (user_id, type, number, holder, expiry, gradient, shadow, is_default, balance)
        VALUES (
            NEW.id,
            'VISA',
            '****' || UPPER(SUBSTRING(NEW.id::text, 10, 8)),
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Card Holder'),
            TO_CHAR(CURRENT_DATE + INTERVAL '3 years', 'MM/YY'),
            'from-blue-600 to-blue-500',
            'shadow-blue-500/20',
            TRUE,
            2.00
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create card for user %: %', NEW.id, SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update triggers for tables with updated_at
DROP TRIGGER IF EXISTS update_mvp_profiles_updated_at ON mvp_profiles;
DROP TRIGGER IF EXISTS update_mvp_accounts_updated_at ON mvp_accounts;
DROP TRIGGER IF EXISTS update_mvp_cards_updated_at ON mvp_cards;
DROP TRIGGER IF EXISTS update_mvp_loans_updated_at ON mvp_loans;
DROP TRIGGER IF EXISTS update_mvp_assets_updated_at ON mvp_assets;
DROP TRIGGER IF EXISTS update_mvp_app_settings_updated_at ON mvp_app_settings;
DROP TRIGGER IF EXISTS update_mvp_support_tickets_updated_at ON mvp_support_tickets;

CREATE TRIGGER update_mvp_profiles_updated_at BEFORE UPDATE ON mvp_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mvp_accounts_updated_at BEFORE UPDATE ON mvp_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mvp_cards_updated_at BEFORE UPDATE ON mvp_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mvp_loans_updated_at BEFORE UPDATE ON mvp_loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mvp_assets_updated_at BEFORE UPDATE ON mvp_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mvp_app_settings_updated_at BEFORE UPDATE ON mvp_app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mvp_support_tickets_updated_at BEFORE UPDATE ON mvp_support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- MIGRATION: Fix existing databases (safe to re-run)
-- Adds any columns that were added to CREATE TABLE after the
-- database was initially created.
-- ============================================================

-- mvp_profiles
ALTER TABLE mvp_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS pin VARCHAR(6),
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kyc_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS kyc_documents JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'light',
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS dob VARCHAR(20),
ADD COLUMN IF NOT EXISTS occupation VARCHAR(100),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS zip VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS daily_limit DECIMAL(15,2) DEFAULT 1000.00,
ADD COLUMN IF NOT EXISTS weekly_limit DECIMAL(15,2) DEFAULT 5000.00,
ADD COLUMN IF NOT EXISTS monthly_limit DECIMAL(15,2) DEFAULT 20000.00,
ADD COLUMN IF NOT EXISTS daily_usage DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS weekly_usage DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS monthly_usage DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS card_controls JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS employer VARCHAR(100),
ADD COLUMN IF NOT EXISTS income_range VARCHAR(100),
ADD COLUMN IF NOT EXISTS profile_image TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- mvp_accounts
ALTER TABLE mvp_accounts
ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT 'bg-blue-600',
ADD COLUMN IF NOT EXISTS is_main BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- mvp_cards
ALTER TABLE mvp_cards
ADD COLUMN IF NOT EXISTS gradient TEXT,
ADD COLUMN IF NOT EXISTS shadow TEXT,
ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pin VARCHAR(6),
ADD COLUMN IF NOT EXISTS cvv VARCHAR(4),
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- mvp_transactions
ALTER TABLE mvp_transactions
ADD COLUMN IF NOT EXISTS uuid VARCHAR(36) UNIQUE DEFAULT uuid_generate_v4()::text,
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS merchant VARCHAR(255),
ADD COLUMN IF NOT EXISTS icon VARCHAR(50);

-- mvp_loans
ALTER TABLE mvp_loans
ADD COLUMN IF NOT EXISTS amount DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS progress DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- mvp_assets
ALTER TABLE mvp_assets
ADD COLUMN IF NOT EXISTS growth DECIMAL(7,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_positive BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- mvp_support_tickets
ALTER TABLE mvp_support_tickets
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- mvp_otp_codes (ensure table exists for auth flows)
CREATE TABLE IF NOT EXISTS mvp_otp_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    type VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mvp_otp_codes_lookup ON mvp_otp_codes(email, code, type);

-- mvp_app_settings
ALTER TABLE mvp_app_settings 
ADD COLUMN IF NOT EXISTS disable_transactions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS email_notifications INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS site_name VARCHAR(255) DEFAULT 'Veltrix Bank',
ADD COLUMN IF NOT EXISTS site_logo TEXT,
ADD COLUMN IF NOT EXISTS site_url TEXT,
ADD COLUMN IF NOT EXISTS enable_daily_limit INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS enable_weekly_limit INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS enable_monthly_limit INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_limit DECIMAL(15,2) DEFAULT 50000.00,
ADD COLUMN IF NOT EXISTS weekly_limit DECIMAL(15,2) DEFAULT 250000.00,
ADD COLUMN IF NOT EXISTS monthly_limit DECIMAL(15,2) DEFAULT 500000.00,
ADD COLUMN IF NOT EXISTS default_transfer_status VARCHAR(50) DEFAULT 'Success',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure seed row exists (id=1 required by AdminDashboard)
INSERT INTO mvp_app_settings (
    id, maintenance_mode, allow_registration, max_transaction_limit,
    disable_transactions, email_notifications, site_name, site_logo, site_url,
    enable_daily_limit, enable_weekly_limit, enable_monthly_limit,
    daily_limit, weekly_limit, monthly_limit,
    default_transfer_status
)
VALUES (
    1, 0, 1, 50000.00,
    0, 1, 'Veltrix Bank', '', '',
    0, 0, 0,
    50000.00, 250000.00, 500000.00,
    'Success'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- OTP CODES (Custom Resend-based OTP for signup/password reset)
-- ============================================================
CREATE TABLE IF NOT EXISTS mvp_otp_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'signup', 'recovery', 'pin_verify'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by email + code + type
CREATE INDEX IF NOT EXISTS idx_mvp_otp_codes_lookup ON mvp_otp_codes(email, code, type);

-- Auto-cleanup old expired codes (run periodically or via cron)
-- DELETE FROM mvp_otp_codes WHERE expires_at < NOW();

-- ============================================================
-- LIVE CHAT (Public support chat for email redirects)
--    Used by: LiveChat.tsx, AdminLiveChat.tsx
-- ============================================================
CREATE TABLE IF NOT EXISTS mvp_live_chat_rooms (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'open',
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source_template VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mvp_live_chat_messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES mvp_live_chat_rooms(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) DEFAULT 'user',
    sender_name VARCHAR(255),
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add last_active_at to existing live chat rooms (for DBs created before this column)
ALTER TABLE mvp_live_chat_rooms ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add source_template to existing live chat rooms (tracks which bank email started the chat)
ALTER TABLE mvp_live_chat_rooms ADD COLUMN IF NOT EXISTS source_template VARCHAR(50);

-- Indexes for live chat performance
CREATE INDEX IF NOT EXISTS idx_live_chat_rooms_email ON mvp_live_chat_rooms(user_email);
CREATE INDEX IF NOT EXISTS idx_live_chat_rooms_status ON mvp_live_chat_rooms(status);
CREATE INDEX IF NOT EXISTS idx_live_chat_rooms_last_msg ON mvp_live_chat_rooms(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_chat_messages_room ON mvp_live_chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_messages_created ON mvp_live_chat_messages(created_at);

-- Enable RLS on live chat tables
ALTER TABLE mvp_live_chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_live_chat_messages ENABLE ROW LEVEL SECURITY;

-- Public insert policies (anyone can create a room/message from the email link)
DROP POLICY IF EXISTS "Public can create chat rooms" ON mvp_live_chat_rooms;
CREATE POLICY "Public can create chat rooms" ON mvp_live_chat_rooms FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can view own chat room by email" ON mvp_live_chat_rooms;
CREATE POLICY "Public can view own chat room by email" ON mvp_live_chat_rooms FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can update own chat room by email" ON mvp_live_chat_rooms;
CREATE POLICY "Public can update own chat room by email" ON mvp_live_chat_rooms FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public can create chat messages" ON mvp_live_chat_messages;
CREATE POLICY "Public can create chat messages" ON mvp_live_chat_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can view chat messages" ON mvp_live_chat_messages;
CREATE POLICY "Public can view chat messages" ON mvp_live_chat_messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can update chat messages" ON mvp_live_chat_messages;
CREATE POLICY "Public can update chat messages" ON mvp_live_chat_messages FOR UPDATE USING (true);

-- Admin: full access on live chat tables (service role bypasses RLS anyway, but explicit for safety)
DROP POLICY IF EXISTS "Admin can manage all chat rooms" ON mvp_live_chat_rooms;
CREATE POLICY "Admin can manage all chat rooms" ON mvp_live_chat_rooms FOR ALL USING (
    EXISTS (SELECT 1 FROM mvp_profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
);
DROP POLICY IF EXISTS "Admin can manage all chat messages" ON mvp_live_chat_messages;
CREATE POLICY "Admin can manage all chat messages" ON mvp_live_chat_messages FOR ALL USING (
    EXISTS (SELECT 1 FROM mvp_profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
);

-- Auto-update trigger for live chat rooms
DROP TRIGGER IF EXISTS update_mvp_live_chat_rooms_updated_at ON mvp_live_chat_rooms;
CREATE TRIGGER update_mvp_live_chat_rooms_updated_at BEFORE UPDATE ON mvp_live_chat_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();