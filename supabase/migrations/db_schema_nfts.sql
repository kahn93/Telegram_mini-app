-- NFT Integration: Table for user NFTs (minted, earned, or imported)
CREATE TABLE nfts (
    id SERIAL PRIMARY KEY,
    userid TEXT REFERENCES users(userid) ON DELETE CASCADE,
    nft_id TEXT NOT NULL,
    name TEXT,
    image_url TEXT,
    description TEXT,
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ton_tx_hash TEXT,
    UNIQUE(userid, nft_id)
);
CREATE INDEX idx_nfts_user ON nfts(userid);
CREATE INDEX idx_nfts_nftid ON nfts(nft_id);
