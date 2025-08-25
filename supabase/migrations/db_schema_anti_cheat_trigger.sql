-- Trigger for anti-cheat: log suspicious activity on duplicate claims
CREATE OR REPLACE FUNCTION log_suspicious_airdrop_claim()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM analytics_events
    WHERE user_id = NEW.user_id
      AND event = 'claim_airdrop'
      AND created_at > now() - interval '1 minute'
  ) THEN
    INSERT INTO analytics_events (user_id, event, details, created_at)
    VALUES (NEW.user_id, 'suspicious_airdrop_claim', 'Duplicate claim within 1 minute', now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_suspicious_airdrop_claim ON analytics_events;
CREATE TRIGGER trg_log_suspicious_airdrop_claim
AFTER INSERT ON analytics_events
FOR EACH ROW
WHEN (NEW.event = 'claim_airdrop')
EXECUTE FUNCTION log_suspicious_airdrop_claim();
