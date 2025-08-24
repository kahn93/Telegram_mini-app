import React from 'react';
import styles from '../App.module.scss';
import doubleTapIcon from '../assets/double-tap.png';

export interface CoinsPerTapProps {
  coinCount: number;
}

function getCoinsPerTap(coinCount: number) {
  return 1 + Math.floor(coinCount / 10000) * 2;
}

const CoinsPerTap: React.FC<CoinsPerTapProps> = ({ coinCount }) => {
  const coinsPerTap = getCoinsPerTap(coinCount);
  return (
    <span className={styles.coinsPerTap}>
      <img src={doubleTapIcon} alt="Coins per tap" style={{ width: 22, marginRight: 4, verticalAlign: 'middle' }} />
      +{coinsPerTap} /tap
    </span>
  );
};

export default CoinsPerTap;
