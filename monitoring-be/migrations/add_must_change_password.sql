-- Migration: Add must_change_password column to users table
-- Date: 2025-11-23
-- Purpose: Force password change for new users and password resets

-- Add column must_change_password (default 0 = tidak wajib ganti password)
ALTER TABLE `users` 
ADD COLUMN `must_change_password` TINYINT(1) NOT NULL DEFAULT 0 
COMMENT '0 = Normal login, 1 = Harus ganti password' 
AFTER `password`;

-- Update existing users: set must_change_password = 0 (normal)
UPDATE `users` SET `must_change_password` = 0;

-- Rollback script (jika perlu):
-- ALTER TABLE `users` DROP COLUMN `must_change_password`;
