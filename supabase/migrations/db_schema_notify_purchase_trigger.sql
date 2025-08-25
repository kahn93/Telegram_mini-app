-- Trigger to automatically notify users after marketplace purchase
CREATE OR REPLACE FUNCTION notify_user_after_purchase()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (userid, message, created_at, read)
  VALUES (NEW.buyer, 'Your purchase has been delivered!', now(), false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_user_after_purchase ON transactions;
CREATE TRIGGER trg_notify_user_after_purchase
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION notify_user_after_purchase();
