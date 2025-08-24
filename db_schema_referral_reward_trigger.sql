-- Trigger to automatically grant referral rewards
CREATE OR REPLACE FUNCTION grant_referral_reward()
RETURNS TRIGGER AS $$
BEGIN
  -- Reward the referrer
  UPDATE users
  SET coins = coins + 20
  WHERE id = NEW.referrer;
  -- Notify the referrer
  INSERT INTO notifications (userid, message, created_at, read)
  VALUES (NEW.referrer, 'You received 20 coins for a successful referral!', now(), false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_grant_referral_reward ON referrals;
CREATE TRIGGER trg_grant_referral_reward
AFTER INSERT ON referrals
FOR EACH ROW
EXECUTE FUNCTION grant_referral_reward();
