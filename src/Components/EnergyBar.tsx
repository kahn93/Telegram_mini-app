import React from 'react';
import styles from '../App.module.scss';
import batteryIcon from '../assets/battery.png';

export interface EnergyBarProps {
  energy: number;
  maxEnergy: number;
}

const EnergyBar: React.FC<EnergyBarProps> = ({ energy, maxEnergy }) => {
  const percent = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));
  return (
    <div className={styles.energyBarContainer}>
      <div className={styles.energyBar} style={{ width: `${percent}%` }} />
      <span className={styles.energyText}>
        <img src={batteryIcon} alt="Energy" style={{ width: 18, marginRight: 4, verticalAlign: 'middle' }} />
        {energy} / {maxEnergy}
      </span>
    </div>
  );
};

export default EnergyBar;
