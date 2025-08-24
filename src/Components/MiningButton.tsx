import { playSound } from '../soundManager';

import React, { useRef } from 'react';
import styles from '../App.module.scss';

interface MiningButtonProps {
  onClick: () => void;
  imgSrc: string;
}

const MiningButton: React.FC<MiningButtonProps> = ({ onClick, imgSrc }) => {
  const btnRef = useRef<HTMLImageElement>(null);
  const gainRef = useRef<HTMLDivElement>(null);

  const handlePress = () => {
    if (btnRef.current) {
      btnRef.current.classList.add(styles.pressed);
      setTimeout(() => btnRef.current && btnRef.current.classList.remove(styles.pressed), 120);
    }
    if (gainRef.current) {
      gainRef.current.style.opacity = '1';
      gainRef.current.classList.remove(styles.coinGain);
      // Force reflow for restart animation
      void gainRef.current.offsetWidth;
      gainRef.current.classList.add(styles.coinGain);
      setTimeout(() => gainRef.current && (gainRef.current.style.opacity = '0'), 700);
    }
    playSound('mining');
    onClick();
  };

  return (
    <div className={styles.miningButtonWrapper}>
      <img
        ref={btnRef}
        src={imgSrc}
        alt="Click to earn coins"
        className={styles.miningButton}
        onClick={handlePress}
      />
      <div ref={gainRef} className={styles.coinGain} style={{ opacity: 0 }}>+💰</div>
    </div>
  );
};

export default MiningButton;
