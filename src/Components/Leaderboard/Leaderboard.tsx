
import { useState, useEffect } from 'react';
import { getAllUsersSupabase } from '../../Database/dbSupabase';
import styles from './styles.module.scss';
import crownIcon from '../../assets/crown.png';
import trophyIcon from '../../assets/trophy.png';



const Leaderboard = () => {
  const [allUsers, setAllUsers] = useState<{ userid: string; country: string; coins: number }[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ userid: string; country: string; coins: number }[]>([]);
  const [tier, setTier] = useState<'global' | 'country' | 'friends'>('global');
  const [userCountry, setUserCountry] = useState<string>('');
  const [friends, setFriends] = useState<string[]>([]); // Fill with friend userIds if available

  useEffect(() => {
    let isMounted = true;
    const fetchLeaderboard = async () => {
      const users = await getAllUsersSupabase();
      users.sort((a, b) => b.coins - a.coins);
      if (isMounted) {
        setAllUsers(users);
        // Try to get user's country from localStorage/profile
        const country = localStorage.getItem('country') || (users.find(u => u.userid === localStorage.getItem('userId'))?.country ?? '');
        setUserCountry(country);
        // Optionally, load friends from localStorage or API
        const friendsList = JSON.parse(localStorage.getItem('friends') || '[]');
        setFriends(friendsList);
        setLeaderboard(users.slice(0, 100));
      }
    };
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let filtered = allUsers;
    if (tier === 'country' && userCountry) {
      filtered = allUsers.filter(u => u.country === userCountry);
    } else if (tier === 'friends' && friends.length > 0) {
      filtered = allUsers.filter(u => friends.includes(u.userid));
    }
    setLeaderboard(filtered.slice(0, 100));
  }, [tier, allUsers, userCountry, friends]);

  return (
    <div className={styles.leaderboard}>
      <h2>Leaderboard</h2>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
        <button onClick={() => setTier('global')} style={{ fontWeight: tier === 'global' ? 700 : 400, background: tier === 'global' ? '#ffe259' : '#fff', borderRadius: 6, padding: '4px 16px', border: '1px solid #eee' }}>Global</button>
        <button onClick={() => setTier('country')} style={{ fontWeight: tier === 'country' ? 700 : 400, background: tier === 'country' ? '#ffe259' : '#fff', borderRadius: 6, padding: '4px 16px', border: '1px solid #eee' }}>Country</button>
        <button onClick={() => setTier('friends')} style={{ fontWeight: tier === 'friends' ? 700 : 400, background: tier === 'friends' ? '#ffe259' : '#fff', borderRadius: 6, padding: '4px 16px', border: '1px solid #eee' }}>Friends</button>
      </div>
      <ul>
        {leaderboard.map((user, index) => (
          <li
            key={user.userid}
            className={
              index === 0
                ? styles.top1
                : index === 1
                ? styles.top2
                : index === 2
                ? styles.top3
                : ''
            }
            style={{ ["--i" as string]: index } as React.CSSProperties}
          >
            {index === 0 && <img src={crownIcon} alt="Crown" style={{ width: 24, marginRight: 4, verticalAlign: 'middle' }} />}
            {index === 1 && <img src={trophyIcon} alt="Trophy" style={{ width: 22, marginRight: 4, verticalAlign: 'middle' }} />}
            {index === 2 && <img src={trophyIcon} alt="Trophy" style={{ width: 20, marginRight: 4, verticalAlign: 'middle', filter: 'grayscale(0.5)' }} />}
            {index + 1}. {user.userid} ({user.country}): {user.coins} coins
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
