-- ANALYTICS EVENTS TABLE
CREATE TABLE analytics_events (
    id SERIAL PRIMARY KEY,
    userid TEXT REFERENCES users(userid) ON DELETE CASCADE,
    event TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_analytics_user ON analytics_events(userid);
CREATE INDEX idx_analytics_event ON analytics_events(event);
-- Telegram Mini-App PostgreSQL Schema
-- Tables, indexes, enums, triggers, and edge functions for Supabase

-- ENUMS
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE arcade_game AS ENUM ('Pacman', 'Asteroids', 'Tetris', 'Plinko', 'SlotMachine');

-- USERS TABLE
CREATE TABLE users (
    userid TEXT PRIMARY KEY,
    country TEXT,
    coins BIGINT DEFAULT 0,
    ton_wallet TEXT,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_users_country ON users(country);
CREATE INDEX idx_users_ton_wallet ON users(ton_wallet);

-- UPGRADES TABLE
CREATE TABLE upgrades (
    id SERIAL PRIMARY KEY,
    userid TEXT REFERENCES users(userid) ON DELETE CASCADE,
    upgrade_key TEXT,
    level INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_upgrades_user ON upgrades(userid);
CREATE INDEX idx_upgrades_key ON upgrades(upgrade_key);

-- ACHIEVEMENTS TABLE
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    userid TEXT REFERENCES users(userid) ON DELETE CASCADE,
    achievement_key TEXT,
    progress INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_achievements_user ON achievements(userid);
CREATE INDEX idx_achievements_key ON achievements(achievement_key);

-- TASKS TABLE
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    userid TEXT REFERENCES users(userid) ON DELETE CASCADE,
    task_key TEXT,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_tasks_user ON tasks(userid);
CREATE INDEX idx_tasks_key ON tasks(task_key);

-- REFERRALS TABLE
CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    referrer_id TEXT REFERENCES users(userid) ON DELETE CASCADE,
    referred_id TEXT REFERENCES users(userid) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);

-- ARCADE SCORES TABLE
CREATE TABLE arcade_scores (
    id SERIAL PRIMARY KEY,
    userid TEXT REFERENCES users(userid) ON DELETE CASCADE,
    game arcade_game,
    score INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_arcade_scores_user ON arcade_scores(userid);
CREATE INDEX idx_arcade_scores_game ON arcade_scores(game);

-- DAILY CHECKINS TABLE
CREATE TABLE daily_checkins (
    id SERIAL PRIMARY KEY,
    userid TEXT REFERENCES users(userid) ON DELETE CASCADE,
    checkin_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(userid, checkin_date)
);
CREATE INDEX idx_checkins_user ON daily_checkins(userid);
CREATE INDEX idx_checkins_date ON daily_checkins(checkin_date);

-- PURCHASES TABLE
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    userid TEXT REFERENCES users(userid) ON DELETE CASCADE,
    amount BIGINT,
    ton_tx_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_purchases_user ON purchases(userid);
CREATE INDEX idx_purchases_tx ON purchases(ton_tx_hash);

-- AIRDROP SNAPSHOTS TABLE
CREATE TABLE airdrop_snapshots (
    id SERIAL PRIMARY KEY,
    snapshot_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    data JSONB
);

-- TRIGGERS & FUNCTIONS
-- Example: Update user coins after purchase
CREATE OR REPLACE FUNCTION update_user_coins_after_purchase() RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET coins = coins + NEW.amount WHERE userid = NEW.userid;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_user_coins_after_purchase
AFTER INSERT ON purchases
FOR EACH ROW EXECUTE FUNCTION update_user_coins_after_purchase();

-- Example: Edge function for airdrop snapshot (Supabase Edge Functions)
-- (This is a placeholder, actual edge function code should be written in TypeScript/JS in Supabase dashboard)
-- CREATE OR REPLACE FUNCTION edge_airdrop_snapshot() RETURNS void AS $$
-- BEGIN
--   -- Call your airdrop logic here
-- END;
-- $$ LANGUAGE plpgsql;

-- Add more triggers/functions as needed for your business logic
