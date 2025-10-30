-- UP migration
CREATE TABLE polls (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_polls_created_by ON polls(created_by);

-- DOWN migration
DROP INDEX IF EXISTS idx_polls_created_by;
DROP TABLE IF EXISTS polls;

