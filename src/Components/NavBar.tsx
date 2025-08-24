import React, { useState } from 'react';
import { isMuted, setMuted } from '../soundManager';
import playImg from '../assets/play.png';
import styles from '../App.module.scss';
import rankingImg from '../assets/ranking.png';
import questImg from '../assets/quest.png';
import cdollarImg from '../assets/cdollar.png';
import moneyImg from '../assets/money.png';
import listImg from '../assets/list.png';
import earnImg from '../assets/earn.png';
import crownImg from '../assets/crown.png';
import airdropImg from '../assets/airdrop.png';
import chatImg from '../assets/tg.png';
import eventsImg from '../assets/trophy.png';
import nftsImg from '../assets/arcade_pacman_sprites.png';
import analyticsImg from '../assets/axs.png';

import boostsImg from '../assets/rocket.png';

export interface NavBarProps {
  onNavigate: (page: string) => void;
}

const navItems = [
  { label: 'Home', page: 'coin', icon: playImg },
  { label: 'Shop', page: 'Shop', icon: moneyImg },
  { label: 'Trophies', page: 'Trophies', icon: rankingImg },
  { label: 'Tasks', page: 'Tasks', icon: questImg },
  { label: 'Upgrades', page: 'Upgrades', icon: cdollarImg },
  { label: 'Friends', page: 'Friends', icon: listImg },
  { label: 'Arcade', page: 'Arcade', icon: earnImg },
  { label: 'Airdrop', page: 'Airdrop', icon: airdropImg },
  { label: 'Leaderboard', page: 'leaderboard', icon: crownImg },
  // Referrals removed from nav
  { label: 'Chat', page: 'chat', icon: chatImg },
  { label: 'Events', page: 'events', icon: eventsImg },
  { label: 'NFTs', page: 'Marketplace', icon: nftsImg },
  { label: 'Analytics', page: 'useranalytics', icon: analyticsImg },
  // { label: 'Marketplace', page: 'Marketplace', icon: marketplaceImg },
  { label: 'Boosts', page: 'Boosts', icon: boostsImg },
  // AdminAnalytics is only shown for admin users (see below)
];

const isAdmin = localStorage.getItem('userRole') === 'admin';

const NavBar: React.FC<NavBarProps> = ({ onNavigate }) => {
  const [muted, setMutedState] = useState(isMuted());
  const handleMuteToggle = () => {
    setMuted(!muted);
    setMutedState(!muted);
  };
  return (
    <nav className={styles.menu}>
      {navItems.map((item) => (
        <button
          key={item.page}
          className={styles.btn}
          onClick={() => onNavigate(item.page)}
          type="button"
        >
          {item.icon && <img src={item.icon} alt={item.label} style={{ height: 20, width: 20, verticalAlign: 'middle' }} />}
        </button>
      ))}
      <button
        className={styles.btn}
        onClick={handleMuteToggle}
        type="button"
        aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
        style={{ background: muted ? '#eee' : '#ffe259', color: '#222', fontWeight: 700 }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      {isAdmin && (
        <button
          className={styles.btn}
          onClick={() => onNavigate('AdminAnalytics')}
          type="button"
          style={{ background: '#ffe259', color: '#222', fontWeight: 700 }}
        >
          Admin
        </button>
      )}
    </nav>
  );
};

export default NavBar;
