
-- 1. ENUM TYPES (must be created before tables)
CREATE TYPE friend_status AS ENUM ('Pending', 'Accepted', 'Blocked');
CREATE TYPE reward_type AS ENUM ('Daily', 'Referral', 'Milestone', 'Event', 'Other');
CREATE TYPE transaction_type AS ENUM ('Purchase', 'Spin_Win', 'Bonus_Payout', 'Deposit', 'Withdraw', 'Gift', 'Other');
CREATE TYPE event_type AS ENUM ('tap', 'upgrade_purchase', 'energy_refill', 'spin', 'bonus_claim', 'login', 'logout', 'other');
CREATE TYPE moderation_status AS ENUM ('Open', 'Reviewed', 'Resolved', 'Rejected');

-- 2. TABLES
-- (All tables, using enums where appropriate)
-- ...existing code, but change all status, reward_type, transaction_type, event_type columns to use the enum types, not VARCHAR...
    is_claimed BOOLEAN,
    PRIMARY KEY (user_id, gift_id)
);

-- Jackpots
CREATE TABLE jackpot_types (
    jackpot_type_id SERIAL PRIMARY KEY,
    type_name VARCHAR
);

CREATE TABLE jackpots (
    jackpot_id SERIAL PRIMARY KEY,
    game_id INT REFERENCES slot_games(game_id),
    jackpot_type_id INT REFERENCES jackpot_types(jackpot_type_id),
    current_value BIGINT,
    last_win_date TIMESTAMP,
    is_active BOOLEAN
);

-- Friends/Social
CREATE TABLE friends (
    user_id BIGINT REFERENCES telegram_users(user_id),
    friend_id BIGINT REFERENCES telegram_users(user_id),
    status VARCHAR, -- e.g., 'Pending', 'Accepted', 'Blocked'
    created_at TIMESTAMP,
    PRIMARY KEY (user_id, friend_id)
);

-- Rewards System
CREATE TABLE rewards (
    reward_id SERIAL PRIMARY KEY,
    reward_name VARCHAR,
    description TEXT,
    reward_type VARCHAR, -- e.g., 'Daily', 'Referral', 'Milestone'
    currency_id INT REFERENCES currencies(currency_id),
    amount BIGINT,
    is_active BOOLEAN
);

CREATE TABLE user_rewards (
    user_id BIGINT REFERENCES telegram_users(user_id),
    reward_id INT REFERENCES rewards(reward_id),
    claim_date TIMESTAMP,
    PRIMARY KEY (user_id, reward_id)
);

-- Click Mining Game Tables (extended)
CREATE TABLE mining_sessions (
    session_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES telegram_users(user_id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    total_taps BIGINT,
    total_mined BIGINT
);

CREATE TABLE spin_logs (
    spin_id BIGSERIAL PRIMARY KEY,
    session_id BIGINT REFERENCES mining_sessions(session_id),
    user_id BIGINT REFERENCES telegram_users(user_id),
    game_id INT REFERENCES slot_games(game_id),
    bet_amount BIGINT,
    win_amount BIGINT,
    win_status BOOLEAN,
    reel_results JSONB,
    timestamp TIMESTAMP
);

CREATE TABLE rtp_log (
    rtp_id BIGSERIAL PRIMARY KEY,
    game_id INT REFERENCES slot_games(game_id),
    date DATE,
    rtp_value DECIMAL
);

-- Optional/Recommended Tables
CREATE TABLE mailbox (
    message_id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT REFERENCES telegram_users(user_id),
    recipient_id BIGINT REFERENCES telegram_users(user_id),
    subject VARCHAR,
    body TEXT,
    date_sent TIMESTAMP,
    is_read BOOLEAN,
    is_claimed BOOLEAN
);

CREATE TABLE purchases (
    purchase_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES telegram_users(user_id),
    product_id VARCHAR,
    amount_paid DECIMAL,
    currency_id INT REFERENCES currencies(currency_id),
    currency_amount BIGINT,
    purchase_date TIMESTAMP
);
-- Toncade Arcade, Slot, and Click Miner Game Database Schema
-- Generated for Supabase (PostgreSQL)

-- Core Game Information
CREATE TABLE genres (
    genre_id SERIAL PRIMARY KEY,
    genre_name VARCHAR NOT NULL
);

CREATE TABLE games (
    game_id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    alternate_title VARCHAR,
    release_year INT,
    description TEXT,
    number_of_players INT,
    is_cocktail_mode BOOLEAN,
    is_horizontal BOOLEAN,
    is_vertical BOOLEAN,
    genre_id INT REFERENCES genres(genre_id)
);

CREATE TABLE game_platforms (
    game_id INT REFERENCES games(game_id),
    platform_id INT,
    PRIMARY KEY (game_id, platform_id)
);

-- Players, High Scores, Leaderboards
CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    join_date DATE,
    country_id INT
);

CREATE TABLE high_scores (
    high_score_id SERIAL PRIMARY KEY,
    game_id INT REFERENCES games(game_id),
    player_id INT REFERENCES players(player_id),
    initials VARCHAR(3),
    score BIGINT,
    date_achieved TIMESTAMP
);

-- Player Management
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR UNIQUE,
    last_login_date TIMESTAMP,
    device_id VARCHAR,
    country_code VARCHAR
);

-- Slot Game Configuration
CREATE TABLE slot_games (
    game_id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    genre VARCHAR,
    release_date DATE,
    is_active BOOLEAN,
    jackpot_type_id INT,
    pay_table_id INT
);

CREATE TABLE reels (
    reel_id SERIAL PRIMARY KEY,
    game_id INT REFERENCES slot_games(game_id),
    reel_number INT,
    symbol_positions JSONB
);

CREATE TABLE symbols (
    symbol_id SERIAL PRIMARY KEY,
    symbol_name VARCHAR,
    image_url VARCHAR,
    is_wild BOOLEAN,
    is_scatter BOOLEAN,
    is_bonus BOOLEAN
);

CREATE TABLE pay_tables (
    pay_table_id SERIAL PRIMARY KEY,
    pay_table_name VARCHAR
);

CREATE TABLE pay_table_entries (
    pay_table_id INT REFERENCES pay_tables(pay_table_id),
    symbol_id INT REFERENCES symbols(symbol_id),
    match_count INT,
    multiplier DECIMAL,
    PRIMARY KEY (pay_table_id, symbol_id, match_count)
);

-- Economy and Player Progression
CREATE TABLE currencies (
    currency_id SERIAL PRIMARY KEY,
    currency_name VARCHAR,
    is_purchasable BOOLEAN
);

CREATE TABLE user_balances (
    user_id BIGINT REFERENCES users(user_id),
    currency_id INT REFERENCES currencies(currency_id),
    balance BIGINT,
    PRIMARY KEY (user_id, currency_id)
);

CREATE TABLE transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id),
    currency_id INT REFERENCES currencies(currency_id),
    transaction_type VARCHAR,
    amount BIGINT,
    timestamp TIMESTAMP,
    purchase_id BIGINT
);

-- Telegram Click Mining Users
CREATE TABLE telegram_users (
    user_id BIGINT PRIMARY KEY,
    username VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    registration_date TIMESTAMP,
    last_active_date TIMESTAMP,
    referrer_id BIGINT REFERENCES telegram_users(user_id),
    ton_wallet_address VARCHAR
);

CREATE TABLE user_stats (
    user_id BIGINT PRIMARY KEY REFERENCES telegram_users(user_id),
    balance_coins BIGINT,
    mining_power DECIMAL,
    energy_capacity INT,
    current_energy INT,
    last_energy_update TIMESTAMP,
    level INT,
    total_taps BIGINT,
    total_mined_coins BIGINT
);

CREATE TABLE upgrades (
    upgrade_id SERIAL PRIMARY KEY,
    upgrade_name VARCHAR,
    upgrade_type VARCHAR,
    base_cost BIGINT,
    cost_multiplier DECIMAL,
    effect_multiplier DECIMAL
);

CREATE TABLE user_upgrades (
    user_id BIGINT REFERENCES telegram_users(user_id),
    upgrade_id INT REFERENCES upgrades(upgrade_id),
    upgrade_level INT,
    purchase_date TIMESTAMP,
    PRIMARY KEY (user_id, upgrade_id)
);

CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    task_name VARCHAR,
    task_description TEXT,
    reward_coins BIGINT,
    is_active BOOLEAN
);

CREATE TABLE user_tasks (
    user_id BIGINT REFERENCES telegram_users(user_id),
    task_id INT REFERENCES tasks(task_id),
    is_completed BOOLEAN,
    completion_date TIMESTAMP,
    PRIMARY KEY (user_id, task_id)
);


-- Referral System
CREATE TABLE referral_rewards (
    reward_id SERIAL PRIMARY KEY,
    reward_name VARCHAR,
    referrer_reward BIGINT,
    referee_reward BIGINT,
    minimum_referee_level INT
);

CREATE TABLE referral_logs (
    log_id BIGSERIAL PRIMARY KEY,
    referrer_id BIGINT REFERENCES telegram_users(user_id),
    referred_user_id BIGINT REFERENCES telegram_users(user_id),
    timestamp TIMESTAMP,
    is_reward_paid BOOLEAN
);

-- Airdrop Management
CREATE TABLE airdrop_eligibility (
    user_id BIGINT PRIMARY KEY REFERENCES telegram_users(user_id),
    final_coin_balance BIGINT,
    eligible_for_airdrop BOOLEAN,
    airdrop_multiplier DECIMAL,
    calculated_ton_tokens DECIMAL,
    snapshot_date TIMESTAMP
);

CREATE TABLE airdrop_transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES telegram_users(user_id),
    ton_wallet_address VARCHAR,
    ton_transaction_hash VARCHAR,
    amount DECIMAL,
    timestamp TIMESTAMP,
    status VARCHAR
);

-- Analytics and Logs
CREATE TABLE gameplay_logs (
    log_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES telegram_users(user_id),
    timestamp TIMESTAMP,
    event_type VARCHAR,
    event_data JSONB
);

-- Leaderboards
CREATE TABLE leaderboards (
    leaderboard_id SERIAL PRIMARY KEY,
    leaderboard_name VARCHAR,
    metric_key VARCHAR
);

CREATE TABLE leaderboard_cache (
    leaderboard_id INT REFERENCES leaderboards(leaderboard_id),
    user_id BIGINT REFERENCES telegram_users(user_id),
    rank INT,
    metric_value BIGINT,
    last_updated TIMESTAMP,
    PRIMARY KEY (leaderboard_id, user_id)
);

-- Achievements
CREATE TABLE achievements (
    achievement_id SERIAL PRIMARY KEY,
    game_id INT REFERENCES games(game_id),
    achievement_name VARCHAR,
    description TEXT,
    criteria JSONB
);

CREATE TABLE user_achievements (
    user_id BIGINT REFERENCES telegram_users(user_id),
    achievement_id INT REFERENCES achievements(achievement_id),
    date_unlocked TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);

-- Game and Session Management
CREATE TABLE user_game_data (
    user_id BIGINT REFERENCES telegram_users(user_id),
    game_id INT REFERENCES games(game_id),
    save_data JSONB,
    last_autosave TIMESTAMP,
    PRIMARY KEY (user_id, game_id)
);
