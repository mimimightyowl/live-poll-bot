-- UP migration
-- Add telegram-specific fields
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS telegram_id VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Remove password_hash as we use Telegram authentication
ALTER TABLE users 
  DROP COLUMN IF EXISTS password_hash;

-- Create index for telegram_id lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- DOWN migration
-- DROP INDEX IF EXISTS idx_users_telegram_id;
-- ALTER TABLE users DROP COLUMN IF EXISTS full_name;
-- ALTER TABLE users DROP COLUMN IF EXISTS telegram_id;
-- ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);

