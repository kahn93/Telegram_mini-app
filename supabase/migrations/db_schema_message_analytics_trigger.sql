-- Trigger to automatically log analytics events for chat messages
CREATE OR REPLACE FUNCTION log_message_analytics_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_events (user_id, event, details, created_at)
  VALUES (NEW.userid, 'chat_message', CONCAT('Message: ', NEW.content), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_message_analytics_event ON messages;
CREATE TRIGGER trg_log_message_analytics_event
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION log_message_analytics_event();
