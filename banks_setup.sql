
-- ==============================================================================
-- BANKS TABLE (External Institutions Registry)
-- Run this script in your MySQL / phpMyAdmin terminal
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `mvp_banks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `logo` LONGTEXT DEFAULT NULL, -- Changed from varchar(255) to LONGTEXT for Base64 images
  `color` varchar(50) DEFAULT 'bg-slate-500', -- Tailwind class or Hex
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- If table exists, you can run this command to upgrade the column:
-- ALTER TABLE `mvp_banks` MODIFY `logo` LONGTEXT;

-- Seed Data (Matches previous mock data)
-- Note: These URLs will still work as LONGTEXT accepts text strings
INSERT INTO `mvp_banks` (`name`, `logo`, `color`) VALUES
('Chase Bank', 'https://logo.clearbit.com/chase.com', 'bg-blue-600'),
('Bank of America', 'https://logo.clearbit.com/bankofamerica.com', 'bg-red-600'),
('Wells Fargo', 'https://logo.clearbit.com/wellsfargo.com', 'bg-yellow-500'),
('Citibank', 'https://logo.clearbit.com/citi.com', 'bg-blue-400'),
('US Bank', 'https://logo.clearbit.com/usbank.com', 'bg-blue-800');
