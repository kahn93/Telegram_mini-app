import * as React from 'react';
import { useState } from 'react';
import styles from './Social.module.scss';
import Friends from './Friends';
import Chat from './Chat';
import Events from './Events';
import LeaderboardMini from '../ArcadeGames/LeaderboardMini';

interface SocialProps {
  userId: string;
}
const Social: React.FC<SocialProps> = ({ userId }) => {
  const [tab, setTab] = useState<'chat' | 'friends' | 'events' | 'leaderboard'>('chat');

  return (
    <div className={styles.socialContainer}>
      <h2 className={styles.socialTitle}>Social</h2>
      <div className={styles.socialTabs}>
        <button className={tab === 'chat' ? styles.activeTab : ''} onClick={() => setTab('chat')}>Chat</button>
        <button className={tab === 'friends' ? styles.activeTab : ''} onClick={() => setTab('friends')}>Friends</button>
        <button className={tab === 'events' ? styles.activeTab : ''} onClick={() => setTab('events')}>Events</button>
        <button className={tab === 'leaderboard' ? styles.activeTab : ''} onClick={() => setTab('leaderboard')}>Leaderboards</button>
      </div>
      {tab === 'chat' && <Chat userId={userId} />}
      {tab === 'friends' && <Friends />}
      {tab === 'events' && <Events userId={userId} />}
      {tab === 'leaderboard' && (
        <div>
          <LeaderboardMini game="Pacman" />
          <LeaderboardMini game="Asteroids" />
          <LeaderboardMini game="Tetris" />
          <LeaderboardMini game="Plinko" />
        </div>
      )}
    </div>
  );
};

export default Social;
