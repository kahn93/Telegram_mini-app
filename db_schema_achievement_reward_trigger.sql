-- Trigger to automatically grant achievement rewards
CREATE OR REPLACE FUNCTION grant_achievement_reward()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET coins = coins + 50
  WHERE id = NEW.userid;
  INSERT INTO notifications (userid, message, created_at, read)
  VALUES (NEW.userid, 'You received 50 coins for unlocking an achievement!', now(), false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_grant_achievement_reward ON achievements;
CREATE TRIGGER trg_grant_achievement_reward
AFTER INSERT ON achievements
FOR EACH ROW
EXECUTE FUNCTION grant_achievement_reward();
