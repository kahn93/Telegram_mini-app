-- Push Notifications/Reminders: Table for scheduled notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    userid TEXT REFERENCES users(userid) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g. 'reminder', 'airdrop', 'friend_joined'
    message TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(userid);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_at);
