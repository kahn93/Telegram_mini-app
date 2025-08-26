type NavBarProps = {
  onNavigate: (page: string) => void;
  extraItems?: { label: string; page: string; icon?: string }[];
};
import * as React from 'react';
import { useState } from 'react';
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
import eventsImg from '../assets/trophy.png';
import nftsImg from '../assets/arcade_pacman_sprites.png';
import analyticsImg from '../assets/axs.png';


// ...existing code...

const navItems = [
  { label: 'Home', page: 'coin', icon: playImg },
  { label: 'Shop', page: 'Shop', icon: moneyImg },
  { label: 'Trophies', page: 'Trophies', icon: rankingImg },
  { label: 'Tasks', page: 'Tasks', icon: questImg },
  { label: 'Upgrades & Boosts', page: 'Upgrades', icon: cdollarImg },
  { label: 'Friends & Chat', page: 'Friends', icon: listImg },
  { label: 'Arcade', page: 'Arcade', icon: earnImg },
  { label: 'Airdrop', page: 'Airdrop', icon: airdropImg },
  { label: 'Leaderboard', page: 'leaderboard', icon: crownImg },
  // Referrals removed from nav
  { label: 'Guardian Angel', page: 'guardianangel', icon: eventsImg },
  { label: 'Events', page: 'events', icon: eventsImg },
  { label: 'NFTs', page: 'Marketplace', icon: nftsImg },
  { label: 'Analytics', page: 'useranalytics', icon: analyticsImg },
  // { label: 'Marketplace', page: 'Marketplace', icon: marketplaceImg },
  // AdminAnalytics is only shown for admin users (see below)
];

const isAdmin = localStorage.getItem('userRole') === 'admin';


// ...existing code...

const NavBar: React.FC<NavBarProps> = ({ onNavigate, extraItems }) => {
  const [muted, setMutedState] = useState(isMuted());
  const [menuOpen, setMenuOpen] = useState(false);
  const handleMuteToggle = () => {
    setMuted(!muted);
    setMutedState(!muted);
  };
  const handleMenuClick = () => {
    setMenuOpen((open) => {
      const next = !open;
      if (next) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return next;
    });
  };
  const handleNav = (page: string) => {
    setMenuOpen(false);
    document.body.style.overflow = '';
    onNavigate(page);
  };
  const allNavItems = extraItems ? [...navItems, ...extraItems] : navItems;
  return (
    <>
      <nav className={styles.menu}>
        <button
          className={styles.btn}
          onClick={handleMenuClick}
          type="button"
          aria-label="Open menu"
          style={{ background: '#ffe259', color: '#222', fontWeight: 700 }}
        >
          ☰
        </button>
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
            onClick={() => handleNav('AdminAnalytics')}
            type="button"
            style={{ background: '#ffe259', color: '#222', fontWeight: 700 }}
          >
            Admin
          </button>
        )}
      </nav>
      {menuOpen && (
        <div className={styles.menuModalOverlay} onClick={() => { setMenuOpen(false); document.body.style.overflow = ''; }}>
          <div className={styles.menuModal} onClick={e => e.stopPropagation()}>
            <div className={styles.menuModalTitle}>Menu</div>
            <div className={styles.menuModalList}>
        {allNavItems.map((item) => (
                <button
                  key={item.page}
                  className={styles.menuModalBtn}
                  onClick={() => handleNav(item.page)}
                  type="button"
                >
                  {item.icon && <img src={item.icon} alt={item.label} style={{ height: 22, width: 22, marginRight: 10, verticalAlign: 'middle' }} />}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
