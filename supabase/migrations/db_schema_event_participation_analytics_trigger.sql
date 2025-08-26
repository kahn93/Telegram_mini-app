-- Trigger to automatically log analytics events for event participation
CREATE OR REPLACE FUNCTION log_event_participation_analytics_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_events (user_id, event, details, created_at)
  VALUES (NEW.userid, 'event_participation', CONCAT('Event: ', NEW.event_id), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_event_participation_analytics_event ON event_participants;
CREATE TRIGGER trg_log_event_participation_analytics_event
AFTER INSERT ON event_participants
FOR EACH ROW
EXECUTE FUNCTION log_event_participation_analytics_event();
