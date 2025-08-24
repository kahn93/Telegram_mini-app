-- Social Feed / In-App Chat: Add messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    userid TEXT REFERENCES users(userid) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    type TEXT DEFAULT 'chat', -- 'chat' or 'feed'
    reply_to INT REFERENCES messages(id)
);
CREATE INDEX idx_messages_user ON messages(userid);
CREATE INDEX idx_messages_created ON messages(created_at);
