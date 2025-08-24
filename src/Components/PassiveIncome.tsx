import React from 'react';
import styles from '../App.module.scss';
import earnIcon from '../assets/earn.png';

export interface PassiveIncomeProps {
  coinsPerHour: number;
}

const PassiveIncome: React.FC<PassiveIncomeProps> = ({ coinsPerHour }) => (
  <div className={styles.passiveIncome}>
    <img src={earnIcon} alt="Passive Income" style={{ width: 22, marginRight: 4, verticalAlign: 'middle' }} />
    +{coinsPerHour.toLocaleString()} /hr
  </div>
);

export default PassiveIncome;
