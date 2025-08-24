import * as React from 'react';
import { useRef, useState } from 'react';
import { uploadToStorage, getPublicUrl } from '../Database/storageSupabase';
import styles from '../App.module.scss';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarChange: (avatar: string) => void;
}

const defaultAvatars = [
  '/vite.svg',
  '/assets/crown.png',
  '/assets/tg.png',
  '/assets/arcade_pacman_sprites.png',
  '/assets/gift.png',
  '/assets/axs.png',
];

const AvatarModal: React.FC<AvatarModalProps> = ({ isOpen, onClose, onAvatarChange }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Upload to Supabase Storage
      const userId = localStorage.getItem('userId') || 'anon';
      const ext = file.name.split('.').pop() || 'png';
      const path = `avatars/${userId}_${Date.now()}.${ext}`;
      const { error } = await uploadToStorage('avatars', path, file);
      if (!error) {
        const publicUrl = getPublicUrl('avatars', path);
        setSelected(publicUrl);
      } else {
        alert('Failed to upload avatar.');
      }
    }
  };

  const handleSelect = (avatar: string) => {
    setSelected(avatar);
  };

  const handleSave = () => {
    if (selected) {
      onAvatarChange(selected);
      onClose();
    }
  };

  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Select or Upload Avatar</h3>
        <div className={styles.avatarGrid}>
          {defaultAvatars.map((src) => (
            <img
              key={src}
              src={src}
              alt="avatar"
              className={styles.avatarOption + (selected === src ? ' ' + styles.selected : '')}
              onClick={() => handleSelect(src)}
              style={{ width: 56, height: 56, borderRadius: '50%', margin: 8, cursor: 'pointer', border: selected === src ? '2px solid #ffe259' : '2px solid #eee' }}
            />
          ))}
        </div>
        <input type="file" accept="image/*" ref={fileInput} onChange={handleFile} style={{ margin: '12px 0' }} />
        {selected && <img src={selected} alt="Selected avatar" style={{ width: 64, height: 64, borderRadius: '50%', margin: 8 }} />}
        <div style={{ marginTop: 12 }}>
          <button onClick={handleSave} style={{ background: '#ffe259', borderRadius: 6, padding: '6px 18px', fontWeight: 700, marginRight: 8 }}>Save</button>
          <button onClick={onClose} style={{ background: '#eee', borderRadius: 6, padding: '6px 18px', fontWeight: 700 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;
