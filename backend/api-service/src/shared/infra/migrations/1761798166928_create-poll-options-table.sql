-- UP migration
CREATE TABLE poll_options (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL
);

-- DOWN migration
DROP TABLE IF EXISTS poll_options;
