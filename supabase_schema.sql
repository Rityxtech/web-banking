-- Lennox Bank Database Schema
-- Run this in Supabase SQL Editor to set up the complete database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- APP SETTINGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS mvp_app_settings (
    id SERIAL PRIMARY KEY,
    maintenance_mode INTEGER DEFAULT 0,
    allow_registration INTEGER DEFAULT 1,
    max_transaction_limit DECIMAL(15,2) DEFAULT 50000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- WAITLIST TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS mvp_waitlist (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- PROFILES TABLE (User profiles)
-- ===========================================
CREATE TABLE IF NOT EXISTS mvp_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    email VARCHAR(255),
    avatar_url TEXT,
    pin VARCHAR(6),
    kyc_level INTEGER DEFAULT 0,
    is_suspended BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    balance DECIMAL(15,2) DEFAULT 0.00,
    daily_limit DECIMAL(15,2) DEFAULT 1000.00,
    weekly_limit DECIMAL(15,2) DEFAULT 5000.00,
    monthly_limit DECIMAL(15,2) DEFAULT 20000.00,
    daily_usage DECIMAL(15,2) DEFAULT 0.00,
    weekly_usage DECIMAL(15,2) DEFAULT 0.00,
    monthly_usage DECIMAL(15,2) DEFAULT 0.00,
    settings JSONB DEFAULT '{}',
    card_controls JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ===========================================
-- ACCOUNTS TABLE
-- ===========================================
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

-- ===========================================
-- TRANSACTIONS TABLE
-- ===========================================
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

-- ===========================================
-- CARDS TABLE
-- ===========================================
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

-- ===========================================
-- LOANS TABLE
-- ===========================================
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

-- ===========================================
-- ASSETS TABLE (Investments)
-- ===========================================
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

-- ===========================================
-- NOTIFICATIONS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS mvp_notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(20) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- SUPPORT MESSAGES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS mvp_support_messages (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_from_user BOOLEAN DEFAULT TRUE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- KYC DOCUMENTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS mvp_kyc_documents (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON mvp_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON mvp_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON mvp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON mvp_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON mvp_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON mvp_loans(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON mvp_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON mvp_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON mvp_support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON mvp_kyc_documents(user_id);

-- ===========================================
-- ROW LEVEL SECURITY POLICIES
-- ===========================================

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
ALTER TABLE mvp_support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_kyc_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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
DROP POLICY IF EXISTS "Users can view own loans" ON mvp_loans;
DROP POLICY IF EXISTS "Users can insert own loans" ON mvp_loans;
DROP POLICY IF EXISTS "Users can update own loans" ON mvp_loans;
DROP POLICY IF EXISTS "Users can view own assets" ON mvp_assets;
DROP POLICY IF EXISTS "Users can insert own assets" ON mvp_assets;
DROP POLICY IF EXISTS "Users can update own assets" ON mvp_assets;
DROP POLICY IF EXISTS "Users can view own notifications" ON mvp_notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON mvp_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON mvp_notifications;
DROP POLICY IF EXISTS "Users can view own support messages" ON mvp_support_messages;
DROP POLICY IF EXISTS "Users can insert own support messages" ON mvp_support_messages;
DROP POLICY IF EXISTS "Users can update own support messages" ON mvp_support_messages;
DROP POLICY IF EXISTS "Users can view own kyc documents" ON mvp_kyc_documents;
DROP POLICY IF EXISTS "Users can insert own kyc documents" ON mvp_kyc_documents;
DROP POLICY IF EXISTS "Users can update own kyc documents" ON mvp_kyc_documents;

-- Public tables (no auth required)
CREATE POLICY "Allow read access to app_settings" ON mvp_app_settings FOR SELECT USING (true);
CREATE POLICY "Allow insert to waitlist" ON mvp_waitlist FOR INSERT WITH CHECK (true);

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

CREATE POLICY "Users can view own loans" ON mvp_loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own loans" ON mvp_loans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own loans" ON mvp_loans FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assets" ON mvp_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assets" ON mvp_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assets" ON mvp_assets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON mvp_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON mvp_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON mvp_notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own support messages" ON mvp_support_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own support messages" ON mvp_support_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own support messages" ON mvp_support_messages FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own kyc documents" ON mvp_kyc_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own kyc documents" ON mvp_kyc_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own kyc documents" ON mvp_kyc_documents FOR UPDATE USING (auth.uid() = user_id);

-- ===========================================
-- DEFAULT DATA
-- ===========================================

-- Insert default app settings
INSERT INTO mvp_app_settings (maintenance_mode, allow_registration, max_transaction_limit)
VALUES (0, 1, 50000.00)
ON CONFLICT DO NOTHING;

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user signup
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Create profile for new user
    BEGIN
        INSERT INTO mvp_profiles (user_id, full_name, email, balance)
        VALUES (
            NEW.id, 
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email), 
            NEW.email, 
            2.00
        );
    EXCEPTION WHEN OTHERS THEN
        -- Simply ignore profile insert errors. The app will auto-heal/create on first login.
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

    -- MUST return NEW to allow the auth.user insert to succeed
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to create profile and default data on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_mvp_profiles_updated_at ON mvp_profiles;
DROP TRIGGER IF EXISTS update_mvp_accounts_updated_at ON mvp_accounts;
DROP TRIGGER IF EXISTS update_mvp_cards_updated_at ON mvp_cards;
DROP TRIGGER IF EXISTS update_mvp_loans_updated_at ON mvp_loans;
DROP TRIGGER IF EXISTS update_mvp_assets_updated_at ON mvp_assets;
DROP TRIGGER IF EXISTS update_mvp_kyc_documents_updated_at ON mvp_kyc_documents;
DROP TRIGGER IF EXISTS update_mvp_app_settings_updated_at ON mvp_app_settings;

CREATE TRIGGER update_mvp_profiles_updated_at BEFORE UPDATE ON mvp_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mvp_accounts_updated_at BEFORE UPDATE ON mvp_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mvp_cards_updated_at BEFORE UPDATE ON mvp_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mvp_loans_updated_at BEFORE UPDATE ON mvp_loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mvp_assets_updated_at BEFORE UPDATE ON mvp_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mvp_kyc_documents_updated_at BEFORE UPDATE ON mvp_kyc_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mvp_app_settings_updated_at BEFORE UPDATE ON mvp_app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();