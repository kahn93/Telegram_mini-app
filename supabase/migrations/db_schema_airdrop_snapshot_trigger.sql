-- Trigger to automatically grant airdrop snapshot rewards
CREATE OR REPLACE FUNCTION grant_airdrop_snapshot_reward()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET coins = coins + NEW.amount
  WHERE id = NEW.userid;
  INSERT INTO notifications (userid, message, created_at, read)
  VALUES (NEW.userid, CONCAT('You received ', NEW.amount, ' coins from an airdrop!'), now(), false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_grant_airdrop_snapshot_reward ON airdrop_snapshots;
CREATE TRIGGER trg_grant_airdrop_snapshot_reward
AFTER INSERT ON airdrop_snapshots
FOR EACH ROW
EXECUTE FUNCTION grant_airdrop_snapshot_reward();
