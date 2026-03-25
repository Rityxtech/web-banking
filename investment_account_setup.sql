-- ==========================================
-- INVESTMENT ACCOUNT SETUP & MANAGEMENT
-- ==========================================

-- 1. VERIFY TABLE SCHEMA (Optional)
-- Ensure 'type' column can accept 'Investment'. usually it is VARCHAR/TEXT.
-- If it is an ENUM, you may need to add 'Investment' to the enum.
-- ALTER TYPE account_type ADD VALUE 'Investment';

-- 2. MANUALLY CREATE INVESTMENT ACCOUNT
-- Replace {USER_ID} with the actual user_id from mvp_users table.
INSERT INTO mvp_accounts (
    user_id,
    name,
    type,
    balance,
    account_number,
    color,
    is_main,
    created_at
) VALUES (
    '{USER_ID}',  -- e.g. 123 or 'uuid'
    'High Yield Savings',
    'Investment',
    0.00,
    '8000123456', -- Generate a unique starting with 8000
    'bg-indigo-900',
    0,
    NOW()
);

-- 3. CHECK EXISTING INVESTMENT ACCOUNTS
SELECT * FROM mvp_accounts WHERE type = 'Investment';

-- 4. UPDATE ACCOUNT BALANCE (Manual Crediting)
-- Replace {ACCOUNT_ID} with the id from step 3.
UPDATE mvp_accounts 
SET balance = balance + 5000 
WHERE id = {ACCOUNT_ID};

-- 5. RESET/DELETE INVESTMENT ACCOUNTS (For Testing)
-- DELETE FROM mvp_accounts WHERE type = 'Investment' AND user_id = '{USER_ID}';
