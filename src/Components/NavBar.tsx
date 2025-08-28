type NavBarProps = {
  onNavigate: (page: string) => void;
  extraItems?: { label: string; page: string; icon?: string }[];
};
import * as React from 'react';
import { useState } from 'react';
import { isMuted, setMuted } from '../soundManager';

import playImg from '../assets/play.png';
import styles from '../App.module.scss';
import questImg from '../assets/quest.png';
import moneyImg from '../assets/money.png';
import earnImg from '../assets/earn.png';
import trophyImg from '../assets/trophy.png';
import angelImg from '../assets/gift.png';
import analyticsImg from '../assets/axs.png';



const navItems = [
  { label: 'Home', page: 'coin', icon: playImg },
  { label: 'Shop', page: 'Shop', icon: moneyImg },
  { label: 'Tasks', page: 'Tasks', icon: questImg },
  { label: 'Arcade', page: 'Arcade', icon: earnImg },
  { label: 'Leaderboard', page: 'leaderboard', icon: trophyImg },
  { label: 'Guardian Angel', page: 'guardianangel', icon: angelImg },
  { label: 'Analytics', page: 'useranalytics', icon: analyticsImg },
];

const isAdmin = localStorage.getItem('userRole') === 'admin';



const NavBar: React.FC<NavBarProps> = ({ onNavigate, extraItems }) => {
  const [muted, setMutedState] = useState(isMuted());
  const handleMuteToggle = () => {
    setMuted(!muted);
    setMutedState(!muted);
  };
  const handleNav = (page: string) => {
    onNavigate(page);
  };
  const allNavItems = extraItems ? [...navItems, ...extraItems] : navItems;
  return (
    <nav className={styles.menu}>
      {allNavItems.map((item) => (
        <button
          key={item.page}
          className={styles.btn}
          onClick={() => handleNav(item.page)}
          type="button"
          aria-label={item.label}
        >
          {item.icon && <img src={item.icon} alt={item.label} style={{ width: 22, height: 22, display: 'block', margin: '0 auto' }} />}
        </button>
      ))}
      <button
        className={styles.btn}
        onClick={handleMuteToggle}
        type="button"
        aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      {isAdmin && (
        <button
          className={styles.btn}
          onClick={() => handleNav('AdminAnalytics')}
          type="button"
        >
          Admin
        </button>
      )}
    </nav>
  );
};

export default NavBar;
