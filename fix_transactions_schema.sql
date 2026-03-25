
-- ==============================================================================
-- LENNOX BANK: FIX MISSING UUID COLUMN
-- Run this in your MySQL / phpMyAdmin SQL tab to fix the "Unknown column" error.
-- ==============================================================================

-- 1. Add the missing UUID column
ALTER TABLE `mvp_transactions` 
ADD COLUMN `uuid` VARCHAR(100) DEFAULT NULL AFTER `id`;

-- 2. Add an index for faster lookups (optional but recommended)
ALTER TABLE `mvp_transactions` 
ADD INDEX `idx_uuid` (`uuid`);

-- 3. (Optional) Backfill existing rows with a random UUID if they are empty
-- This ensures old transactions (if any exist) have a valid UUID.
UPDATE `mvp_transactions` 
SET `uuid` = CONCAT('TX-', FLOOR(RAND() * 1000000)) 
WHERE `uuid` IS NULL;
