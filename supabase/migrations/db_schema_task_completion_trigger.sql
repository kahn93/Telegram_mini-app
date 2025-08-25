-- Trigger to automatically grant task completion rewards
CREATE OR REPLACE FUNCTION grant_task_completion_reward()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET coins = coins + 15
  WHERE id = NEW.userid;
  INSERT INTO notifications (userid, message, created_at, read)
  VALUES (NEW.userid, 'You received 15 coins for completing a task!', now(), false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_grant_task_completion_reward ON tasks;
CREATE TRIGGER trg_grant_task_completion_reward
AFTER UPDATE OF completed ON tasks
FOR EACH ROW
WHEN (NEW.completed = true AND OLD.completed = false)
EXECUTE FUNCTION grant_task_completion_reward();
