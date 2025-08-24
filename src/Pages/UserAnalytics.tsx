import React, { useEffect, useState } from 'react';
import { getUserAnalytics } from '../Database/userAnalyticsSupabase';

const UserAnalytics: React.FC<{ userId: string }> = ({ userId }) => {
  const [stats, setStats] = useState<null | {
    totalCoins: number;
    gamesPlayed: number;
    referrals: number;
    achievements: number;
    nfts: number;
  }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserAnalytics(userId).then(data => {
      setStats(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <div>Loading analytics...</div>;
  if (!stats) return <div>No analytics found.</div>;

  return (
    <div style={{ maxWidth: 340, margin: '24px auto', background: '#f8fafc', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px #24308a11' }}>
      <h3 style={{ color: '#24308a', fontWeight: 800, fontSize: 16, marginBottom: 12 }}>Your Analytics</h3>
      <div style={{ fontSize: 14, marginBottom: 8 }}><b>Total Coins Earned:</b> {stats.totalCoins.toLocaleString()}</div>
      <div style={{ fontSize: 14, marginBottom: 8 }}><b>Games Played:</b> {stats.gamesPlayed}</div>
      <div style={{ fontSize: 14, marginBottom: 8 }}><b>Referrals:</b> {stats.referrals}</div>
      <div style={{ fontSize: 14, marginBottom: 8 }}><b>Achievements:</b> {stats.achievements}</div>
      <div style={{ fontSize: 14, marginBottom: 8 }}><b>NFTs Owned:</b> {stats.nfts}</div>
    </div>
  );
};

export default UserAnalytics;
