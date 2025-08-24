import React from 'react';
import styles from '../App.module.scss';
import coinIcon from '../assets/cdollar.png';

export interface CoinBalanceProps {
  coinCount: number;
}

const CoinBalance: React.FC<CoinBalanceProps> = ({ coinCount }) => (
  <h1 className={styles.coinBalance}>
    <img src={coinIcon} alt="Coin" style={{ width: 32, marginRight: 8, verticalAlign: 'middle' }} />
    {coinCount}
  </h1>
);

export default CoinBalance;
