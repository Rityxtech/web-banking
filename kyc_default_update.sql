
-- ==============================================================================
-- LENNOX BANK: KYC ZERO TRUST UPDATE
-- Run this in your MySQL / phpMyAdmin SQL tab
-- ==============================================================================

-- 1. Modify the table to make 0 the default value for new users
ALTER TABLE `mvp_profiles` 
MODIFY COLUMN `kyc_level` INT(11) DEFAULT 0;

-- 2. (Optional) Reset all existing 'user' role profiles to KYC 0
--    Do not run this if you want to keep current users verified.
--    This ensures everyone must pass KYC 1 to transact.
UPDATE `mvp_profiles` 
SET `kyc_level` = 0 
WHERE `role` = 'user';

-- 3. Ensure Admins are verified (Level 2) so they don't get locked out
UPDATE `mvp_profiles` 
SET `kyc_level` = 2 
WHERE `role` = 'admin';
