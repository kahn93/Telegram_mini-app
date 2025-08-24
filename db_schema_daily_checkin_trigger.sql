-- Trigger to automatically grant daily check-in rewards
CREATE OR REPLACE FUNCTION grant_daily_checkin_reward()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET coins = coins + 10
  WHERE id = NEW.userid;
  INSERT INTO notifications (userid, message, created_at, read)
  VALUES (NEW.userid, 'You received 10 coins for daily check-in!', now(), false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_grant_daily_checkin_reward ON daily_checkins;
CREATE TRIGGER trg_grant_daily_checkin_reward
AFTER INSERT ON daily_checkins
FOR EACH ROW
EXECUTE FUNCTION grant_daily_checkin_reward();
