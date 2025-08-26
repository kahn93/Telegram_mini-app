-- Additional tables for advanced game features

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id bigint REFERENCES users(userid),
  session_token text,
  device_info jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_settings (
  key text PRIMARY KEY,
  value jsonb,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag text UNIQUE,
  enabled boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id bigint REFERENCES users(userid),
  action text,
  target_user_id bigint REFERENCES users(userid),
  details jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id bigint REFERENCES users(userid),
  user_id bigint REFERENCES users(userid),
  action text,
  reason text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  description text,
  type text,
  rarity text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id bigint REFERENCES users(userid),
  item_id uuid REFERENCES items(id),
  quantity int DEFAULT 1,
  acquired_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id bigint REFERENCES users(userid),
  referred_id bigint REFERENCES users(userid),
  reward_type text,
  reward_amount bigint,
  granted_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id bigint REFERENCES users(userid),
  activity text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id bigint REFERENCES users(userid),
  type text,
  message text,
  read boolean DEFAULT false,
  sent_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  description text,
  start_time timestamptz,
  end_time timestamptz,
  reward jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES game_events(id),
  user_id bigint REFERENCES users(userid),
  progress int DEFAULT 0,
  completed boolean DEFAULT false,
  reward_claimed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leaderboard_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text,
  snapshot jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id bigint REFERENCES users(userid),
  message text,
  status text DEFAULT 'open',
  response text,
  created_at timestamptz DEFAULT now(),
  closed_at timestamptz
);
