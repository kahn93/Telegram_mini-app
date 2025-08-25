-- BOOSTS TABLE
CREATE TABLE IF NOT EXISTS boosts (
    id SERIAL PRIMARY KEY,
    userid TEXT REFERENCES users(userid) ON DELETE CASCADE,
    boost_key TEXT NOT NULL,
    active_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(userid, boost_key)
);
CREATE INDEX IF NOT EXISTS idx_boosts_user ON boosts(userid);

-- RLS: Only allow users to read/write their own boosts
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view own boosts" ON boosts FOR SELECT USING (auth.uid() = userid);
CREATE POLICY "User can modify own boosts" ON boosts FOR INSERT, UPDATE, DELETE USING (auth.uid() = userid);

-- MARKETPLACE LISTINGS TABLE
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id SERIAL PRIMARY KEY,
    seller TEXT REFERENCES users(userid) ON DELETE CASCADE,
    item TEXT NOT NULL,
    price FLOAT NOT NULL,
    type TEXT CHECK (type IN ('boost', 'nft', 'item')),
    status TEXT CHECK (status IN ('active', 'sold')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON marketplace_listings(seller);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_listings(status);

-- RLS: Only allow users to update/delete their own listings, all can read active listings
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active listings" ON marketplace_listings FOR SELECT USING (status = 'active');
CREATE POLICY "User can modify own listings" ON marketplace_listings FOR UPDATE, DELETE USING (auth.uid() = seller);
CREATE POLICY "User can insert listings" ON marketplace_listings FOR INSERT WITH CHECK (auth.uid() = seller);

-- TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    listing_id INT REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    buyer TEXT REFERENCES users(userid) ON DELETE CASCADE,
    seller TEXT REFERENCES users(userid) ON DELETE CASCADE,
    price FLOAT NOT NULL,
    type TEXT CHECK (type IN ('boost', 'nft', 'item')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller);
CREATE INDEX IF NOT EXISTS idx_transactions_listing ON transactions(listing_id);

-- RLS: Only allow buyer and seller to view their transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyer or seller can view transaction" ON transactions FOR SELECT USING (auth.uid() = buyer OR auth.uid() = seller);
CREATE POLICY "Anyone can insert transaction" ON transactions FOR INSERT WITH CHECK (true);
