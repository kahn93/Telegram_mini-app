-- Multi-level Referral Rewards 2.0 Schema Additions
-- Add parent_referral_id to referrals for multi-level tracking
ALTER TABLE referrals ADD COLUMN parent_referral_id INT REFERENCES referrals(id);

-- Add referral_level to referrals for easier querying
ALTER TABLE referrals ADD COLUMN referral_level INT DEFAULT 1;

-- Add referral_code to users for unique invite links
ALTER TABLE users ADD COLUMN referral_code TEXT UNIQUE;

-- Add referral_leaderboard materialized view for fast leaderboard queries
CREATE MATERIALIZED VIEW referral_leaderboard AS
SELECT referrer_id, COUNT(*) AS direct_referrals, SUM(COALESCE(r2_count,0)) AS indirect_referrals
FROM referrals r
LEFT JOIN (
  SELECT parent_referral_id, COUNT(*) AS r2_count
  FROM referrals
  WHERE parent_referral_id IS NOT NULL
  GROUP BY parent_referral_id
) r2 ON r.id = r2.parent_referral_id
GROUP BY referrer_id;

CREATE INDEX idx_leaderboard_referrer ON referral_leaderboard(referrer_id);
