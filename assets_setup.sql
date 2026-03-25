
-- ==============================================================================
-- ASSETS TABLE (Investments Registry)
-- Run this script in your MySQL / phpMyAdmin terminal
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `mvp_assets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `symbol` varchar(20) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `amount` decimal(20,2) NOT NULL DEFAULT '0.00',
  `shares` decimal(20,6) NOT NULL DEFAULT '0.000000',
  `growth` decimal(10,2) DEFAULT '0.00',
  `is_positive` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- REFRESH SCHEMA CACHE
-- (Optional: Run if using PostgREST or specific API layers that cache schema)
-- NOTIFY pgrst, 'reload schema';
