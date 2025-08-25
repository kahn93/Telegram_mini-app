-- Fix RLS policies: cast auth.uid() to text for all user checks

-- BOOSTS RLS
DROP POLICY IF EXISTS "User can view own boosts" ON boosts;
DROP POLICY IF EXISTS "User can modify own boosts" ON boosts;
CREATE POLICY "User can view own boosts" ON boosts FOR SELECT USING (auth.uid()::text = userid);
CREATE POLICY "User can modify own boosts" ON boosts FOR INSERT, UPDATE, DELETE USING (auth.uid()::text = userid);

-- MARKETPLACE LISTINGS RLS
DROP POLICY IF EXISTS "User can modify own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "User can insert listings" ON marketplace_listings;
CREATE POLICY "User can modify own listings" ON marketplace_listings FOR UPDATE, DELETE USING (auth.uid()::text = seller);
CREATE POLICY "User can insert listings" ON marketplace_listings FOR INSERT WITH CHECK (auth.uid()::text = seller);

-- TRANSACTIONS RLS
DROP POLICY IF EXISTS "Buyer or seller can view transaction" ON transactions;
CREATE POLICY "Buyer or seller can view transaction" ON transactions FOR SELECT USING (auth.uid()::text = buyer OR auth.uid()::text = seller);
