-- Functions and triggers for extra tables

-- Log user session creation
CREATE OR REPLACE FUNCTION log_user_session()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, activity, details)
  VALUES (NEW.user_id, 'session_start', jsonb_build_object('session_token', NEW.session_token, 'device_info', NEW.device_info, 'ip_address', NEW.ip_address));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_user_session
AFTER INSERT ON user_sessions
FOR EACH ROW EXECUTE FUNCTION log_user_session();

-- Log feature flag changes
CREATE OR REPLACE FUNCTION log_feature_flag_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, activity, details)
  VALUES (NULL, 'feature_flag_change', jsonb_build_object('flag', NEW.flag, 'enabled', NEW.enabled));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_feature_flag_change
AFTER INSERT OR UPDATE ON feature_flags
FOR EACH ROW EXECUTE FUNCTION log_feature_flag_change();

-- Log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, activity, details)
  VALUES (NEW.admin_id, 'admin_action', jsonb_build_object('action', NEW.action, 'target_user_id', NEW.target_user_id, 'details', NEW.details));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_admin_action
AFTER INSERT ON admin_actions
FOR EACH ROW EXECUTE FUNCTION log_admin_action();

-- Log moderation actions
CREATE OR REPLACE FUNCTION log_moderation_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, activity, details)
  VALUES (NEW.moderator_id, 'moderation_action', jsonb_build_object('user_id', NEW.user_id, 'action', NEW.action, 'reason', NEW.reason));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_moderation_action
AFTER INSERT ON moderation_logs
FOR EACH ROW EXECUTE FUNCTION log_moderation_action();

-- Log item acquisition
CREATE OR REPLACE FUNCTION log_item_acquisition()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, activity, details)
  VALUES (NEW.user_id, 'item_acquired', jsonb_build_object('item_id', NEW.item_id, 'quantity', NEW.quantity));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_item_acquisition
AFTER INSERT ON user_inventory
FOR EACH ROW EXECUTE FUNCTION log_item_acquisition();

-- Log referral reward
CREATE OR REPLACE FUNCTION log_referral_reward()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, activity, details)
  VALUES (NEW.referrer_id, 'referral_reward', jsonb_build_object('referred_id', NEW.referred_id, 'reward_type', NEW.reward_type, 'reward_amount', NEW.reward_amount));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_referral_reward
AFTER INSERT ON referral_rewards
FOR EACH ROW EXECUTE FUNCTION log_referral_reward();

-- Log notification read
CREATE OR REPLACE FUNCTION log_notification_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read = true AND OLD.read = false THEN
    INSERT INTO user_activity_log (user_id, activity, details)
    VALUES (NEW.user_id, 'notification_read', jsonb_build_object('notification_id', NEW.id));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_notification_read
AFTER UPDATE OF read ON notifications
FOR EACH ROW EXECUTE FUNCTION log_notification_read();

-- Log event participation
CREATE OR REPLACE FUNCTION log_event_participation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, activity, details)
  VALUES (NEW.user_id, 'event_participation', jsonb_build_object('event_id', NEW.event_id, 'progress', NEW.progress, 'completed', NEW.completed));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_event_participation
AFTER INSERT OR UPDATE ON event_participants
FOR EACH ROW EXECUTE FUNCTION log_event_participation();

-- Log user feedback
CREATE OR REPLACE FUNCTION log_user_feedback()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, activity, details)
  VALUES (NEW.user_id, 'user_feedback', jsonb_build_object('message', NEW.message, 'status', NEW.status));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_user_feedback
AFTER INSERT ON user_feedback
FOR EACH ROW EXECUTE FUNCTION log_user_feedback();
