-- Migration: Add messages table for real-time chat
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id BIGINT REFERENCES telegram_users(user_id),
  recipient_id BIGINT REFERENCES telegram_users(user_id),
  text TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
