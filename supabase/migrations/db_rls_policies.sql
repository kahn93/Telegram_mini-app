
-- ANALYTICS EVENTS TABLE: Users can insert/view their own events, admin can view all
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their analytics events" ON analytics_events
  FOR SELECT USING (auth.uid()::text = userid OR EXISTS (SELECT 1 FROM users WHERE userid = auth.uid()::text AND role = 'admin'));
CREATE POLICY "Users can insert their analytics events" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid()::text = userid);
-- Supabase RLS Policies for Telegram Mini-App

-- USERS TABLE: Only allow users to read/update their own row
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = userid);
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = userid);

-- UPGRADES TABLE: Only allow users to read/update their own upgrades
ALTER TABLE upgrades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their upgrades" ON upgrades
  FOR SELECT USING (auth.uid()::text = userid);
CREATE POLICY "Users can update their upgrades" ON upgrades
  FOR UPDATE USING (auth.uid()::text = userid);

-- ACHIEVEMENTS TABLE: Only allow users to read/update their own achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their achievements" ON achievements
  FOR SELECT USING (auth.uid()::text = userid);
CREATE POLICY "Users can update their achievements" ON achievements
  FOR UPDATE USING (auth.uid()::text = userid);

-- TASKS TABLE: Only allow users to read/update their own tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their tasks" ON tasks
  FOR SELECT USING (auth.uid()::text = userid);
CREATE POLICY "Users can update their tasks" ON tasks
  FOR UPDATE USING (auth.uid()::text = userid);

-- REFERRALS TABLE: Only allow users to view referrals where they are referrer or referred
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their referrals" ON referrals
  FOR SELECT USING (auth.uid()::text = referrer_id OR auth.uid()::text = referred_id);

-- ARCADE SCORES TABLE: Only allow users to read/insert their own scores
ALTER TABLE arcade_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their scores" ON arcade_scores
  FOR SELECT USING (auth.uid()::text = userid);
CREATE POLICY "Users can insert their scores" ON arcade_scores
  FOR INSERT WITH CHECK (auth.uid()::text = userid);

-- DAILY CHECKINS TABLE: Only allow users to read/insert their own checkins
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their checkins" ON daily_checkins
  FOR SELECT USING (auth.uid()::text = userid);
CREATE POLICY "Users can insert their checkins" ON daily_checkins
  FOR INSERT WITH CHECK (auth.uid()::text = userid);

-- PURCHASES TABLE: Only allow users to read/insert their own purchases
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their purchases" ON purchases
  FOR SELECT USING (auth.uid()::text = userid);
CREATE POLICY "Users can insert their purchases" ON purchases
  FOR INSERT WITH CHECK (auth.uid()::text = userid);

-- AIRDROP SNAPSHOTS TABLE: Only allow admin to read/insert
ALTER TABLE airdrop_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view/insert airdrop snapshots" ON airdrop_snapshots
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE userid = auth.uid()::text AND role = 'admin'));

-- You may need to adjust auth.uid() logic if you use external auth (e.g., Telegram user id mapping)
