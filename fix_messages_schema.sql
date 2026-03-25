
-- ==============================================================================
-- LENNOX BANK: FIX MESSAGE STORAGE & DEDUPLICATION
-- Run this in your MySQL / phpMyAdmin SQL tab
-- ==============================================================================

-- 1. Modify 'text' column to LONGTEXT to support full Base64 images
--    Standard TEXT is 64KB, which truncates images > 64KB, causing corruption and dupes.
ALTER TABLE `mvp_messages` 
MODIFY COLUMN `text` LONGTEXT DEFAULT NULL;

-- 2. Modify 'message' column in tickets to LONGTEXT as well
ALTER TABLE `mvp_support_tickets` 
MODIFY COLUMN `message` LONGTEXT DEFAULT NULL;

-- 3. Add 'client_id' to messages for robust frontend deduplication
--    This allows the frontend to match its optimistic temp message with the server record.
ALTER TABLE `mvp_messages`
ADD COLUMN `client_id` VARCHAR(100) DEFAULT NULL AFTER `user_id`;

-- 4. Add index for performance on client_id lookups
ALTER TABLE `mvp_messages`
ADD INDEX `idx_client_id` (`client_id`);

-- 5. Force Schema Cache Reload (for PostgREST/Supabase layers if applicable, otherwise ignored by MySQL)
-- NOTIFY pgrst, 'reload schema';
