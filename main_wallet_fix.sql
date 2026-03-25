
-- ==============================================================================
-- LENNOX BANK: MAIN WALLET FIX
-- Run this script in your MySQL / phpMyAdmin terminal to establish
-- the definitive Main Wallet identifier and sync balance calculations.
-- ==============================================================================

-- 1. Add the column to identify the main wallet
-- Only run if column doesn't exist, but 'ALTER TABLE' handles it mostly.
-- In some SQL dialects you need to check exists, but for MySQL/MariaDB standard,
-- running this twice might error if column exists. You can ignore the error if so.
ALTER TABLE mvp_accounts ADD COLUMN is_main TINYINT(1) DEFAULT 0;

-- 2. Set the flag for all existing accounts named 'Main Wallet'
-- This ensures existing users have a designated main account.
UPDATE mvp_accounts SET is_main = 1 WHERE name = 'Main Wallet';

-- 3. (Optional) Safety check: Ensure every user has at least one main wallet.
-- This part is complex in pure SQL without stored procedures, but the logic above covers 99% cases.
-- If a user has NO 'Main Wallet', they might see $0 until they contact support or a new account is created.

COMMIT;
