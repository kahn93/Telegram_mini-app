-- View for unified arcade leaderboard: top score per user per game
CREATE OR REPLACE VIEW arcade_leaderboard AS
SELECT
  game,
  userid,
  MAX(score) AS score,
  MAX(created_at) AS last_played
FROM arcade_scores
GROUP BY game, userid;

-- Index for leaderboard view (optional, for performance)
-- CREATE INDEX idx_leaderboard_game ON arcade_leaderboard(game);
