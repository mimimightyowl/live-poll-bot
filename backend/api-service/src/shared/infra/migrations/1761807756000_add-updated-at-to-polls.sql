-- UP migration
ALTER TABLE polls ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create a trigger to automatically update updated_at on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_polls_updated_at
BEFORE UPDATE ON polls
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- DOWN migration
DROP TRIGGER IF EXISTS update_polls_updated_at ON polls;
DROP FUNCTION IF EXISTS update_updated_at_column;
ALTER TABLE polls DROP COLUMN IF EXISTS updated_at;

