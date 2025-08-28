-- Players table
CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE games (
    game_id SERIAL PRIMARY KEY,
    player_id INT REFERENCES players(player_id),
    score INT NOT NULL DEFAULT 0,
    end_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard table
CREATE TABLE leaderboard (
    leaderboard_id SERIAL PRIMARY KEY,
    player_id INT REFERENCES players(player_id),
    score INT NOT NULL,
    submission_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function to update leaderboard after a new game
CREATE OR REPLACE FUNCTION update_leaderboard_trigger_fn() RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM leaderboard) < 10 THEN
        INSERT INTO leaderboard (player_id, score) VALUES (NEW.player_id, NEW.score);
    ELSE
        IF NEW.score > (SELECT MIN(score) FROM leaderboard) THEN
            DELETE FROM leaderboard WHERE leaderboard_id = (
                SELECT leaderboard_id FROM leaderboard ORDER BY score ASC LIMIT 1
            );
            INSERT INTO leaderboard (player_id, score) VALUES (NEW.player_id, NEW.score);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function after insert on games
CREATE TRIGGER update_leaderboard_trigger
AFTER INSERT ON games
FOR EACH ROW
EXECUTE FUNCTION update_leaderboard_trigger_fn();
