import React, { useState, useEffect } from 'react';
import AvatarModal from '../Components/AvatarModal';
import { getUserSupabase, updateUserProfileSupabase, User } from '../Database/dbSupabase';
import tgIcon from '../assets/tg.png';
import crownIcon from '../assets/crown.png';
import giftIcon from '../assets/gift.png';
import axsIcon from '../assets/axs.png';
import airdropIcon from '../assets/airdrop.png';
import trophyIcon from '../assets/trophy.png';
import moneyIcon from '../assets/money.png';

const AVATAR_OPTIONS = [
  { src: '/vite.svg', label: 'Default' },
  { src: tgIcon, label: 'Telegram' },
  { src: crownIcon, label: 'Crown' },
  { src: giftIcon, label: 'Gift' },
  { src: axsIcon, label: 'AXS' },
  { src: airdropIcon, label: 'Airdrop' },
];

const BADGE_OPTIONS = [
  { label: 'Early Bird', icon: crownIcon },
  { label: 'Top Referrer', icon: tgIcon },
  { label: 'Arcade Champ', icon: trophyIcon },
  { label: 'Airdrop Winner', icon: airdropIcon },
];

const Profile: React.FC<{ userId: string }> = ({ userId }) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [badges, setBadges] = useState<string[]>([]);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  useEffect(() => {
    getUserSupabase(userId).then(user => {
      setProfile(user);
      setNickname(user?.nickname || '');
      setAvatar(user?.avatar_url || AVATAR_OPTIONS[0].src);
      setBadges(user?.badges || []);
      setLoading(false);
    });
  }, [userId]);

  const saveProfile = async () => {
    setLoading(true);
    await updateUserProfileSupabase(userId, { nickname, avatar_url: avatar, badges });
    setEdit(false);
    setLoading(false);
  };

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>Profile not found.</div>;

  return (
    <div style={{ maxWidth: 340, margin: '24px auto', background: '#f8fafc', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px #24308a11' }}>
      <h2 style={{ color: '#24308a', fontWeight: 800, fontSize: 16, marginBottom: 12 }}>Your Profile</h2>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <img src={avatar} alt="avatar" style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid #ffe259' }} />
        <button onClick={() => setAvatarModalOpen(true)} style={{ marginTop: 8, background: '#ffe259', borderRadius: 6, padding: '4px 14px', fontWeight: 700 }}>Change Avatar</button>
      </div>
      <AvatarModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onAvatarChange={(newAvatar) => setAvatar(newAvatar)}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <img src={moneyIcon} alt="Coins" style={{ width: 18, verticalAlign: 'middle' }} />
          <b>Coins:</b> <span style={{ color: '#b88a00', fontWeight: 700 }}>{profile.coins?.toLocaleString() ?? 0}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <b>Country:</b> <span>{profile.country || '(unknown)'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#888' }}>
          <b>User ID:</b> <span style={{ fontFamily: 'monospace' }}>{profile.userid}</span>
        </div>
      </div>
      {edit ? (
        <>
          <div style={{ marginBottom: 8 }}>
            <label>Nickname: <input value={nickname} onChange={e => setNickname(e.target.value)} style={{ borderRadius: 4, padding: 4 }} /></label>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Avatar: </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {AVATAR_OPTIONS.map(opt => (
                <div key={opt.src} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => setAvatar(opt.src)}>
                  <img src={opt.src} alt={opt.label} style={{ width: 38, height: 38, borderRadius: '50%', border: avatar === opt.src ? '2px solid #24308a' : '2px solid #ffe259', marginBottom: 2, background: '#fff' }} />
                  <span style={{ fontSize: 10 }}>{opt.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Badges: </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {BADGE_OPTIONS.map(b => (
                <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={badges.includes(b.label)}
                    onChange={e => {
                      if (e.target.checked) setBadges([...badges, b.label]);
                      else setBadges(badges.filter(badge => badge !== b.label));
                    }}
                  />
                  <img src={b.icon} alt={b.label} style={{ width: 16, verticalAlign: 'middle' }} />
                  <span style={{ fontSize: 11 }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={saveProfile} style={{ background: '#ffe259', borderRadius: 6, padding: '4px 16px', fontWeight: 700 }}>Save</button>
          <button onClick={() => setEdit(false)} style={{ marginLeft: 8, borderRadius: 6, padding: '4px 16px' }}>Cancel</button>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}><b>Nickname:</b> {profile.nickname || '(none)'}</div>
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><b>Badges:</b> {profile.badges && profile.badges.length ? profile.badges.map(badge => {
            const badgeObj = BADGE_OPTIONS.find(b => b.label === badge);
            return badgeObj ? (
              <span key={badge} style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#fffbe6', borderRadius: 4, padding: '2px 6px', fontSize: 11, border: '1px solid #ffe259' }}>
                <img src={badgeObj.icon} alt={badgeObj.label} style={{ width: 14, verticalAlign: 'middle' }} />
                {badgeObj.label}
              </span>
            ) : badge;
          }) : <span style={{ fontSize: 11 }}>(none)</span>}</div>
          <button onClick={() => setEdit(true)} style={{ background: '#ffe259', borderRadius: 6, padding: '4px 16px', fontWeight: 700 }}>Edit Profile</button>
        </>
      )}
    </div>
  );
};

export default Profile;
