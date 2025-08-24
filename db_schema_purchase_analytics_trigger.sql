-- Trigger to automatically log analytics events for purchases
CREATE OR REPLACE FUNCTION log_purchase_analytics_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_events (user_id, event, details, created_at)
  VALUES (NEW.buyer, 'purchase', CONCAT('Purchased item: ', NEW.item, ', type: ', NEW.type), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_purchase_analytics_event ON transactions;
CREATE TRIGGER trg_log_purchase_analytics_event
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION log_purchase_analytics_event();
