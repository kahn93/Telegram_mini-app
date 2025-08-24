import React, { useEffect, useState } from 'react';
import { getUserNFTs, mintNFT, NFT } from '../Database/nftsSupabase';

const NFTGallery: React.FC<{ userId: string }> = ({ userId }) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    getUserNFTs(userId).then(data => {
      setNfts(data);
      setLoading(false);
    });
  }, [userId, minting]);

  const handleMint = async () => {
    if (!name || !imageUrl) return;
    setMinting(true);
    await mintNFT({ userid: userId, nft_id: Date.now().toString(), name, image_url: imageUrl, description: desc });
    setName(''); setImageUrl(''); setDesc('');
    setMinting(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '24px auto', background: '#f8fafc', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px #24308a11' }}>
      <h3 style={{ color: '#24308a', fontWeight: 800, fontSize: 16, marginBottom: 12 }}>Your NFTs</h3>
      {loading ? <div>Loading NFTs...</div> : nfts.length === 0 ? <div style={{ color: '#888' }}>No NFTs yet.</div> : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {nfts.map(nft => (
            <div key={nft.nft_id} style={{ background: '#fff', borderRadius: 8, padding: 8, width: 120, boxShadow: '0 1px 4px #24308a08' }}>
              <img src={nft.image_url} alt={nft.name} style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover', marginBottom: 4 }} />
              <div style={{ fontWeight: 700, fontSize: 13 }}>{nft.name}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{nft.description}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 12 }}>
        <h4 style={{ fontSize: 14, color: '#24308a', marginBottom: 6 }}>Mint New NFT</h4>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ borderRadius: 4, padding: 4, marginBottom: 4, width: '100%' }} />
        <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL" style={{ borderRadius: 4, padding: 4, marginBottom: 4, width: '100%' }} />
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" style={{ borderRadius: 4, padding: 4, marginBottom: 4, width: '100%' }} />
        <button onClick={handleMint} disabled={minting || !name || !imageUrl} style={{ background: '#ffe259', borderRadius: 6, padding: '4px 16px', fontWeight: 700, width: '100%' }}>Mint NFT</button>
      </div>
    </div>
  );
};

export default NFTGallery;
