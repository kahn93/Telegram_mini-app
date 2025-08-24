import React from 'react';
import styles from './Upgrades.module.scss';
import cdollarIcon from '../assets/cdollar.png';
import earnIcon from '../assets/earn.png';
import ewalletIcon from '../assets/ewallet.png';
import giftIcon from '../assets/gift.png';
import turboIcon from '../assets/turbo.png';
import crownIcon from '../assets/crown.png';
import buttonIcon from '../assets/button.png';
import axsIcon from '../assets/axs.png';
import moneyIcon from '../assets/money.png';
import questIcon from '../assets/quest.png';

const UPGRADE_DEFS = [
	{ key: 'coinPerTap', name: 'Coin Per Tap', desc: '+Coins/tap', baseValue: 2, basePrice: 400, icon: cdollarIcon },
	{ key: 'passiveIncome', name: 'Passive Income', desc: '+Coins/hr', baseValue: 100, basePrice: 500, icon: earnIcon },
	{ key: 'energy', name: 'Energy', desc: '+Max energy', baseValue: 100, basePrice: 300, icon: ewalletIcon },
	{ key: 'hungerDrive', name: 'Hunger Drive', desc: '+Passive/hr', baseValue: 500, basePrice: 500, icon: giftIcon },
	{ key: 'energyRegen', name: 'Energy Regen', desc: '+Energy regen', baseValue: 1, basePrice: 350, icon: turboIcon },
	{ key: 'tapStreak', name: 'Tap Streak', desc: 'Streak bonus', baseValue: 10, basePrice: 600, icon: crownIcon },
	{ key: 'criticalTap', name: 'Critical Tap', desc: 'Crit chance', baseValue: 1, basePrice: 700, icon: buttonIcon },
	{ key: 'autoMiner', name: 'Auto Miner', desc: 'Auto/hr', baseValue: 50, basePrice: 800, icon: turboIcon },
	{ key: 'energySaver', name: 'Energy Saver', desc: '-Energy/tap', baseValue: 1, basePrice: 900, icon: axsIcon },
	{ key: 'magnet', name: 'Coin Magnet', desc: 'Bonus/hr', baseValue: 100, basePrice: 1000, icon: moneyIcon },
	{ key: 'ultraBoost', name: 'Ultra Boost', desc: 'x2 1hr', baseValue: 1, basePrice: 2000, icon: questIcon },
	{ key: 'goldenTouch', name: 'Golden Touch', desc: '+10/tap', baseValue: 10, basePrice: 2500, icon: buttonIcon },
];

const MAX_LEVEL = 5000;

type UpgradesProps = {
	upgrades: Record<string, number>;
	coins: number;
	onPurchase: (key: string) => void;
};

const Upgrades: React.FC<UpgradesProps> = ({ upgrades, coins, onPurchase }) => {
	return (
		<div className={styles.upgradesPage}>
			<h2>Upgrades</h2>
			<div className={styles.upgradeGrid}>
				{UPGRADE_DEFS.map((u) => {
					const level = upgrades[u.key] || 0;
					const price = u.basePrice * Math.pow(2, level);
					const value = u.baseValue * Math.pow(2, level);
					return (
						<div className={styles.upgradeCard} key={u.key}>
							<img src={u.icon} alt={u.name} className={styles.icon} />
							<div className={styles.title}>{u.name}</div>
							<div className={styles.desc}>{u.desc}</div>
							<div className={styles.level}>Level: {level}</div>
							<div className={styles.value}>Value: +{value}</div>
							<div className={styles.price}>Price: {price} coins</div>
														<button
															className={styles.buyBtn}
															disabled={coins < price || level >= MAX_LEVEL}
															onClick={() => onPurchase(u.key)}
															aria-label={level >= MAX_LEVEL ? `${u.name} maxed out` : `Upgrade ${u.name} for ${price} coins`}
															tabIndex={0}
															onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !(coins < price || level >= MAX_LEVEL)) onPurchase(u.key); }}
															onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px #24308a'}
															onBlur={e => e.currentTarget.style.boxShadow = 'none'}
														>
															{level >= MAX_LEVEL ? 'Maxed' : 'Upgrade'}
														</button>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Upgrades;
