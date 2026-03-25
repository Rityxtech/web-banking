
-- ==============================================================================
-- LENNOX BANK CORE REGISTRY SETUP
-- Run this script in your MySQL / phpMyAdmin terminal
-- ==============================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- 1. PROFILES TABLE (Identity Registry)
CREATE TABLE IF NOT EXISTS `mvp_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'user',
  `kyc_level` int(11) DEFAULT '1',
  `is_suspended` tinyint(1) DEFAULT '0',
  `theme` varchar(20) DEFAULT 'light',
  `avatar_url` LONGTEXT DEFAULT NULL,
  `kyc_documents` LONGTEXT DEFAULT NULL,
  `settings` LONGTEXT DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `zip` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. ACCOUNTS TABLE (Ledger Balance Nodes)
CREATE TABLE IF NOT EXISTS `mvp_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT 'Main Wallet',
  `type` varchar(50) DEFAULT 'Checking',
  `balance` decimal(20,2) DEFAULT '0.00',
  `account_number` varchar(50) DEFAULT NULL,
  `color` varchar(50) DEFAULT 'bg-blue-600',
  `is_main` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TRANSACTIONS TABLE (Movement History)
CREATE TABLE IF NOT EXISTS `mvp_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(100) DEFAULT NULL,
  `user_id` varchar(255) NOT NULL,
  `account_id` int(11) DEFAULT NULL,
  `amount` decimal(20,2) NOT NULL,
  `description` text DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Success',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. CARDS TABLE (Virtual Assets)
CREATE TABLE IF NOT EXISTS `mvp_cards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `type` varchar(50) DEFAULT 'VISA',
  `number` varchar(20) DEFAULT NULL,
  `holder` varchar(255) DEFAULT NULL,
  `expiry` varchar(10) DEFAULT NULL,
  `pin` varchar(10) DEFAULT NULL,
  `cvv` varchar(10) DEFAULT NULL,
  `is_frozen` tinyint(1) DEFAULT '0',
  `is_default` tinyint(1) DEFAULT '0',
  `gradient` varchar(255) DEFAULT NULL,
  `shadow` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS `mvp_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `type` varchar(50) DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. MESSAGES TABLE (AI Assistant & Agent Logs)
CREATE TABLE IF NOT EXISTS `mvp_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `ticket_id` int(11) DEFAULT NULL,
  `text` text DEFAULT NULL,
  `sender` varchar(50) DEFAULT 'user',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS `mvp_support_tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Open',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. APP SETTINGS (Global Configuration)
CREATE TABLE IF NOT EXISTS `mvp_app_settings` (
  `id` int(11) NOT NULL DEFAULT '1',
  `maintenance_mode` tinyint(1) DEFAULT '0',
  `allow_registration` tinyint(1) DEFAULT '1',
  `max_transaction_limit` decimal(20,2) DEFAULT '50000.00',
  `email_notifications` tinyint(1) DEFAULT '1',
  `disable_transactions` tinyint(1) DEFAULT '0',
  `site_name` varchar(255) DEFAULT 'Lennox Bank',
  `site_logo` LONGTEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. WAITLIST
CREATE TABLE IF NOT EXISTS `mvp_waitlist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SEED SETTINGS
INSERT IGNORE INTO `mvp_app_settings` (`id`, `maintenance_mode`, `allow_registration`, `max_transaction_limit`, `site_name`) 
VALUES (1, 0, 1, 50000.00, 'Lennox Bank');

COMMIT;