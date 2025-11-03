-- Development seed data for live-poll-bot
-- This file contains sample data for development and testing purposes

BEGIN;

-- Clear existing data (in reverse order of dependencies)
TRUNCATE TABLE votes CASCADE;
TRUNCATE TABLE poll_options CASCADE;
TRUNCATE TABLE polls CASCADE;
TRUNCATE TABLE users CASCADE;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE polls_id_seq RESTART WITH 1;
ALTER SEQUENCE poll_options_id_seq RESTART WITH 1;
ALTER SEQUENCE votes_id_seq RESTART WITH 1;

-- Insert users
-- Note: All users have password_hash='dev_password' for easy testing
INSERT INTO users (username, email, password_hash, full_name, telegram_id, created_at, updated_at) VALUES
  ('admin', 'admin@example.com', 'dev_password', 'Admin User', '123456789', NOW(), NOW()),
  ('alice', 'alice@example.com', 'dev_password', 'Alice Johnson', '987654321', NOW(), NOW()),
  ('bob', 'bob@example.com', 'dev_password', 'Bob Smith', NULL, NOW(), NOW());

-- Insert polls
INSERT INTO polls (question, created_by, created_at, updated_at) VALUES
  ('What''s your favorite programming language?', 1, NOW(), NOW()),
  ('Best time for team meeting?', 1, NOW(), NOW()),
  ('Preferred communication tool?', 2, NOW(), NOW()),
  ('Where should we go for team lunch?', 3, NOW(), NOW());

-- Insert poll options
-- Poll 1: Programming language (with votes)
INSERT INTO poll_options (poll_id, text) VALUES
  (1, 'JavaScript'),
  (1, 'Python'),
  (1, 'TypeScript'),
  (1, 'Go');

-- Poll 2: Meeting time
INSERT INTO poll_options (poll_id, text) VALUES
  (2, '9:00 AM'),
  (2, '2:00 PM'),
  (2, '4:00 PM');

-- Poll 3: Communication tool
INSERT INTO poll_options (poll_id, text) VALUES
  (3, 'Slack'),
  (3, 'Discord'),
  (3, 'Telegram'),
  (3, 'Microsoft Teams');

-- Poll 4: Lunch location
INSERT INTO poll_options (poll_id, text) VALUES
  (4, 'Italian Restaurant'),
  (4, 'Sushi Bar'),
  (4, 'Food Court');

-- Insert votes for Poll 1 (Programming language)
-- Admin votes for TypeScript
INSERT INTO votes (poll_option_id, user_id, created_at) VALUES
  (3, 1, NOW());

-- Alice votes for Python
INSERT INTO votes (poll_option_id, user_id, created_at) VALUES
  (2, 2, NOW());

-- Bob votes for TypeScript
INSERT INTO votes (poll_option_id, user_id, created_at) VALUES
  (3, 3, NOW());

COMMIT;

-- Summary of seeded data:
-- Users: 3 (admin, alice, bob)
-- Polls: 4 (1 with votes, 3 without votes)
-- Poll Options: 14 total
-- Votes: 3 votes on Poll 1

