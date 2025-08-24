import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import boostIcon from '../assets/rocket.png';
import nftIcon from '../assets/logo.png';
import itemIcon from '../assets/gift.png';
import tonIcon from '../assets/money.png';
import { mintNFT } from '../Database/nftsSupabase';

interface Listing {
  id: number;
  seller: string;
  item: string;
  price: number;
  type: 'boost' | 'nft' | 'item';
  status: 'active' | 'sold';
}

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<'boost' | 'nft' | 'item'>('item');
  const [creating, setCreating] = useState(false);
  // NFT minting fields
  const [nftName, setNftName] = useState('');
  const [nftImageUrl, setNftImageUrl] = useState('');
  const [nftDesc, setNftDesc] = useState('');

  useEffect(() => {
    supabase
      .from('marketplace_listings')
      .select('*')
      .eq('status', 'active')
      .then(({ data }) => {
        setListings(data || []);
        setLoading(false);
      });
  }, []);

  const handleBuy = async (listing: Listing) => {
    await supabase
      .from('marketplace_listings')
      .update({ status: 'sold' })
      .eq('id', listing.id);
    setListings(listings.filter(l => l.id !== listing.id));
    alert(`Purchased ${listing.item}!`);
  };

  return (
    <div style={{ maxWidth: 600, margin: '32px auto', padding: 24 }}>
      <h2 style={{ textAlign: 'center', color: '#24308a', fontWeight: 800 }}>Marketplace</h2>
      <form
        style={{ marginBottom: 32, background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px #0001' }}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!item || !price) return;
          setCreating(true);
          const user = localStorage.getItem('userId') || 'anon';
          let nftId = undefined;
          // If NFT, mint first
          if (type === 'nft') {
            if (!nftName || !nftImageUrl) {
              alert('Please fill NFT name and image URL');
              setCreating(false);
              return;
            }
            nftId = Date.now().toString();
            const { error: mintError } = await mintNFT({ userid: user, nft_id: nftId, name: nftName, image_url: nftImageUrl, description: nftDesc });
            if (mintError) {
              alert('Error minting NFT!');
              setCreating(false);
              return;
            }
          }
          const { error, data } = await supabase.from('marketplace_listings').insert([
            {
              seller: user,
              item: type === 'nft' ? nftName : item,
              price: parseFloat(price),
              type,
              status: 'active',
              ...(type === 'nft' ? { nft_id: nftId, image_url: nftImageUrl, description: nftDesc } : {})
            }
          ]);
          setCreating(false);
          // Fix: type-safe handling of Supabase insert result
          type InsertedListing = { id: number; seller: string; item: string; price: number; type: 'boost' | 'nft' | 'item'; status: 'active' | 'sold' };
          const arr = data as InsertedListing[] | null;
          if (!error && arr && arr.length > 0 && typeof arr[0].id === 'number') {
            setListings((prev) => [...prev, { id: arr[0].id, seller: user, item: type === 'nft' ? nftName : item, price: parseFloat(price), type, status: 'active' }]);
            setItem('');
            setPrice('');
            setType('item');
            setNftName('');
            setNftImageUrl('');
            setNftDesc('');
          } else {
            alert('Error creating listing!');
          }
        }}
      >
        <h4 style={{ margin: 0, color: '#24308a' }}>Create Listing</h4>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {type === 'nft' ? (
            <>
              <input
                placeholder="NFT Name"
                value={nftName}
                onChange={e => setNftName(e.target.value)}
                style={{ flex: 2, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                required
              />
              <input
                placeholder="Image URL"
                value={nftImageUrl}
                onChange={e => setNftImageUrl(e.target.value)}
                style={{ flex: 2, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                required
              />
              <input
                placeholder="Description"
                value={nftDesc}
                onChange={e => setNftDesc(e.target.value)}
                style={{ flex: 2, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
              />
            </>
          ) : (
            <input
              placeholder="Item name"
              value={item}
              onChange={e => setItem(e.target.value)}
              style={{ flex: 2, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
              required
            />
          )}
          <input
            placeholder="Price (TON)"
            value={price}
            onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
            style={{ flex: 1, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
            required
            type="number"
            min="0.01"
            step="0.01"
          />
          <select value={type} onChange={e => setType(e.target.value as 'boost' | 'nft' | 'item')} style={{ flex: 1, padding: 6, borderRadius: 4 }}>
            <option value="item">Item</option>
            <option value="boost">Boost</option>
            <option value="nft">NFT</option>
          </select>
          <button type="submit" disabled={creating} style={{ background: '#ffe259', color: '#222', fontWeight: 700, border: 'none', borderRadius: 4, padding: '0 16px' }}>
            {creating ? 'Listing...' : 'List'}
          </button>
        </div>
      </form>
      {loading ? (
        <div style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>Loading...</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {listings.map(listing => (
            <li key={listing.id} style={{
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 8,
              margin: '12px 0',
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {listing.type === 'boost' && <img src={boostIcon} alt="Boost" style={{ width: 28, verticalAlign: 'middle' }} />}
                {listing.type === 'nft' && <img src={nftIcon} alt="NFT" style={{ width: 28, verticalAlign: 'middle' }} />}
                {listing.type === 'item' && <img src={itemIcon} alt="Item" style={{ width: 28, verticalAlign: 'middle' }} />}
                <strong>{listing.item}</strong> <span style={{ fontSize: 12, color: '#888' }}>({listing.type})</span><br />
                <span style={{ color: '#888', fontSize: 11 }}>Seller: {listing.seller}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={tonIcon} alt="TON" style={{ width: 22, verticalAlign: 'middle' }} />
                <span style={{ fontWeight: 700, color: '#24308a' }}>{listing.price} TON</span>
                <button
                  style={{
                    marginLeft: 16,
                    padding: '6px 14px',
                    borderRadius: 4,
                    background: '#ffe259',
                    color: '#222',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleBuy(listing)}
                >
                  Buy
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!loading && listings.length === 0 && (
        <div style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>No active listings.</div>
      )}
    </div>
  );
};

export default Marketplace;
