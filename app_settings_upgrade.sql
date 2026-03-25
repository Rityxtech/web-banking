-- ==============================================================================
-- LENNOX BANK: App Settings Table Upgrade
-- Run this in phpMyAdmin or your MySQL terminal to add missing columns
-- that allow maintenance_mode, transaction disruption, and limits to persist.
-- ==============================================================================

-- Add missing columns (safe to run even if some already exist via ALTER IGNORE)
ALTER TABLE `mvp_app_settings`
    ADD COLUMN IF NOT EXISTS `site_logo` LONGTEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `enable_daily_limit` tinyint(1) DEFAULT '1',
    ADD COLUMN IF NOT EXISTS `enable_weekly_limit` tinyint(1) DEFAULT '1',
    ADD COLUMN IF NOT EXISTS `enable_monthly_limit` tinyint(1) DEFAULT '1',
    ADD COLUMN IF NOT EXISTS `daily_limit` decimal(20,2) DEFAULT '50000.00',
    ADD COLUMN IF NOT EXISTS `weekly_limit` decimal(20,2) DEFAULT '250000.00',
    ADD COLUMN IF NOT EXISTS `monthly_limit` decimal(20,2) DEFAULT '500000.00';

-- Ensure a row with id=1 exists (required for UPDATE to work)
INSERT IGNORE INTO `mvp_app_settings`
    (`id`, `maintenance_mode`, `allow_registration`, `disable_transactions`,
     `max_transaction_limit`, `site_name`, `enable_daily_limit`,
     `enable_weekly_limit`, `enable_monthly_limit`,
     `daily_limit`, `weekly_limit`, `monthly_limit`)
VALUES
    (1, 0, 1, 0, 50000.00, 'Lennox Bank', 1, 1, 1, 50000.00, 250000.00, 500000.00);

-- Verify
SELECT * FROM `mvp_app_settings` WHERE id = 1;
