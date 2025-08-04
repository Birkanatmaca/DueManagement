-- Remove is_verified column from pending_users table
ALTER TABLE pending_users DROP COLUMN IF EXISTS is_verified; 