-- Trigger to automatically log analytics events for NFT mints
CREATE OR REPLACE FUNCTION log_nft_mint_analytics_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_events (user_id, event, details, created_at)
  VALUES (NEW.userid, 'nft_minted', CONCAT('NFT: ', NEW.nft_id, ', name: ', NEW.name), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_nft_mint_analytics_event ON nfts;
CREATE TRIGGER trg_log_nft_mint_analytics_event
AFTER INSERT ON nfts
FOR EACH ROW
EXECUTE FUNCTION log_nft_mint_analytics_event();
