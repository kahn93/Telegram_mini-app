import React from 'react';
import styles from './Trophies.module.scss';

import { trophiesList, Trophy } from './trophiesData';

type TrophiesProps = {
	coinCount: number;
	energy: number;
	shopPurchases: number;
	earned: Record<string, boolean>;
	onEarn: (trophy: Trophy) => void;
};

const Trophies: React.FC<TrophiesProps> = ({ coinCount, energy, shopPurchases, earned, onEarn }) => {
	// Summarized descriptions for compact display
	const shortDescs: Record<string, string> = {
		firstTap: 'First coin',
		hundredCoins: '100 coins',
		thousandCoins: '1K coins',
		tenKCoins: '10K coins',
		fiftyKCoins: '50K',
		hundredKCoins: '100K',
		millionCoins: '1M',
		energyMax: 'Max energy',
		shopper: '5 buys',
		allTrophies: 'All done',
	};

	React.useEffect(() => {
		trophiesList.forEach((trophy) => {
			if (!earned[trophy.key]) {
				let achieved = false;
				if (trophy.key === 'firstTap' && coinCount >= trophy.milestone) achieved = true;
				if (trophy.key === 'hundredCoins' && coinCount >= trophy.milestone) achieved = true;
				if (trophy.key === 'thousandCoins' && coinCount >= trophy.milestone) achieved = true;
				if (trophy.key === 'tenKCoins' && coinCount >= trophy.milestone) achieved = true;
				if (trophy.key === 'fiftyKCoins' && coinCount >= trophy.milestone) achieved = true;
				if (trophy.key === 'hundredKCoins' && coinCount >= trophy.milestone) achieved = true;
				if (trophy.key === 'millionCoins' && coinCount >= trophy.milestone) achieved = true;
				if (trophy.key === 'energyMax' && energy >= trophy.milestone) achieved = true;
				if (trophy.key === 'shopper' && shopPurchases >= trophy.milestone) achieved = true;
				if (trophy.key === 'allTrophies' && Object.values(earned).filter(Boolean).length >= 9) achieved = true;
				if (achieved) onEarn(trophy);
			}
		});
	}, [coinCount, energy, shopPurchases, earned, onEarn]);

	return (
		<div className={styles.trophiesPage}>
			<div className={styles.trophiesTitle}>Trophies</div>
			<div className={styles.trophyList}>
				{trophiesList.map((trophy) => (
					<div
						key={trophy.key}
						className={
							styles.trophyCard + (earned[trophy.key] ? ' ' + styles.earned : '')
						}
					>
						<img src={trophy.icon} alt={trophy.name} className={styles.trophyIcon} />
						<div className={styles.trophyName}>{trophy.name}</div>
						<div className={styles.trophyDesc}>
							{shortDescs[trophy.key] || trophy.desc}
						</div>
						<div className={styles.trophyReward}>+{trophy.reward}</div>
						{earned[trophy.key] && <div style={{ color: '#1bbf4c', fontWeight: 700, fontSize: 10 }}>Unlocked!</div>}
					</div>
				))}
			</div>
		</div>
	);
};

export default Trophies;
