-- Add is_verified column to pending_users table
ALTER TABLE pending_users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
 
-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_pending_users_verified ON pending_users(is_verified); 