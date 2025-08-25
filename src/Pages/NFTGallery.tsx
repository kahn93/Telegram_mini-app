import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { getUserNFTs, NFT } from '../Database/nftsSupabase';
import { nftMint } from '../Database/edgeFunctions';
import { uploadToStorage } from '../Database/storageSupabase';

interface NFTGalleryProps {
  userId: string;
}

const NFTGallery: React.FC<NFTGalleryProps> = ({ userId }) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getUserNFTs(userId).then(data => {
      setNfts(data);
      setLoading(false);
    });
  }, [userId, minting]);

  const handleMint = async () => {
    if (!name || (!imageUrl && !imageFile)) return;
    setMinting(true);
    if (imageFile) {
      const ext = imageFile.name.split('.').pop() || 'png';
      const path = `nfts/${userId}_${Date.now()}.${ext}`;
      const { error } = await uploadToStorage('nfts', path, imageFile);
      if (error) {
        alert('Failed to upload NFT image.');
        setMinting(false);
        return;
      }
      // Optionally, you could pass the image URL to the Edge Function if supported
    }
    await nftMint({ userId, nftType: name });
    setName(''); setImageUrl(''); setDesc(''); setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
  <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL (or upload below)" style={{ borderRadius: 4, padding: 4, marginBottom: 4, width: '100%' }} />
  <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setImageFile(e.target.files?.[0] || null)} style={{ marginBottom: 4, width: '100%' }} />
  <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" style={{ borderRadius: 4, padding: 4, marginBottom: 4, width: '100%' }} />
  <button onClick={handleMint} disabled={minting || !name || (!imageUrl && !imageFile)} style={{ background: '#ffe259', borderRadius: 6, padding: '4px 16px', fontWeight: 700, width: '100%' }}>Mint NFT</button>
      </div>
    </div>
  );
};

export default NFTGallery;
