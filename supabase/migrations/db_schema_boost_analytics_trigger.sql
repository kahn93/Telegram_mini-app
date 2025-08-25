-- Trigger to automatically log analytics events for boost activations
CREATE OR REPLACE FUNCTION log_boost_analytics_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_events (user_id, event, details, created_at)
  VALUES (NEW.userid, 'boost_activated', CONCAT('Boost: ', NEW.boost_key, ', until: ', NEW.active_until), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_boost_analytics_event ON boosts;
CREATE TRIGGER trg_log_boost_analytics_event
AFTER INSERT OR UPDATE ON boosts
FOR EACH ROW
EXECUTE FUNCTION log_boost_analytics_event();
