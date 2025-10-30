-- UP migration
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  poll_option_id INTEGER NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (poll_option_id, user_id)
);

-- DOWN migration
DROP TABLE IF EXISTS votes;
