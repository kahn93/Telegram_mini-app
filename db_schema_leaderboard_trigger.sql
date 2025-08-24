-- Trigger to automatically update leaderboard after arcade score insert
CREATE OR REPLACE FUNCTION update_leaderboard_after_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Example: upsert into leaderboard table (if exists)
  INSERT INTO leaderboard (userid, score, updated_at)
  VALUES (NEW.userid, NEW.score, now())
  ON CONFLICT (userid) DO UPDATE
    SET score = GREATEST(leaderboard.score, EXCLUDED.score), updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_leaderboard_after_score ON arcade_scores;
CREATE TRIGGER trg_update_leaderboard_after_score
AFTER INSERT ON arcade_scores
FOR EACH ROW
EXECUTE FUNCTION update_leaderboard_after_score();
