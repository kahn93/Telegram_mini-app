-- Trigger function for automatic delivery after transaction
CREATE OR REPLACE FUNCTION deliver_marketplace_item()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'boost' THEN
    INSERT INTO boosts (userid, boost_key, active_until)
    VALUES (NEW.buyer, NEW.item, now() + interval '1 hour')
    ON CONFLICT (userid, boost_key) DO UPDATE
      SET active_until = now() + interval '1 hour';
  ELSIF NEW.type = 'nft' THEN
    INSERT INTO nfts (userid, nft_id, name, minted_at)
    VALUES (NEW.buyer, NEW.item, NEW.item, now())
    ON CONFLICT (userid, nft_id) DO NOTHING;
  -- Add more delivery logic for 'item' as needed
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deliver_marketplace_item ON transactions;
CREATE TRIGGER trg_deliver_marketplace_item
AFTER INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION deliver_marketplace_item();
