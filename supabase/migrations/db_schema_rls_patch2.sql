-- Split RLS policies for INSERT, UPDATE, DELETE

-- BOOSTS RLS
CREATE POLICY "User can insert own boosts" ON boosts FOR INSERT WITH CHECK (auth.uid()::text = userid);
CREATE POLICY "User can update own boosts" ON boosts FOR UPDATE USING (auth.uid()::text = userid);
CREATE POLICY "User can delete own boosts" ON boosts FOR DELETE USING (auth.uid()::text = userid);

-- MARKETPLACE LISTINGS RLS
CREATE POLICY "User can update own listings" ON marketplace_listings FOR UPDATE USING (auth.uid()::text = seller);
CREATE POLICY "User can delete own listings" ON marketplace_listings FOR DELETE USING (auth.uid()::text = seller);
CREATE POLICY "User can insert listings" ON marketplace_listings FOR INSERT WITH CHECK (auth.uid()::text = seller);
