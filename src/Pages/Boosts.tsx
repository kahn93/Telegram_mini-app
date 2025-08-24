
import React, { useState } from 'react';
import styles from '../App.module.scss';

import doubleCoinsIcon from '../assets/dollar.png';
import energyRefillIcon from '../assets/ewallet.png';
import autoMinerIcon from '../assets/mining.png';
import passiveBoostIcon from '../assets/earn.png';

const BOOSTS = [
	{
		key: 'doubleCoins',
		name: 'Double Coins',
		description: 'Doubles all coins earned for 1 hour.',
		price: 1000,
		duration: 60 * 60 * 1000,
		icon: doubleCoinsIcon,
	},
	{
		key: 'energyRefill',
		name: 'Energy Refill',
		description: 'Instantly refill your energy to max.',
		price: 500,
		duration: 0,
		icon: energyRefillIcon,
	},
	{
		key: 'autoMiner',
		name: 'Auto Miner',
		description: 'Automatically mines coins for 1 hour.',
		price: 2000,
		duration: 60 * 60 * 1000,
		icon: autoMinerIcon,
	},
	{
		key: 'passiveBoost',
		name: 'Passive Boost',
		description: 'Doubles passive income for 1 hour.',
		price: 1500,
		duration: 60 * 60 * 1000,
		icon: passiveBoostIcon,
	},
];

const Boosts: React.FC<{
	coinCount?: number;
	onPurchase?: (boost: string) => void;
	activeBoosts?: Record<string, number>;
}> = ({ coinCount = 0, onPurchase, activeBoosts = {} }) => {
	const [purchased, setPurchased] = useState<Record<string, number>>(activeBoosts);

	const handlePurchase = (boost: typeof BOOSTS[0]) => {
		if (coinCount < boost.price) {
			alert('Not enough coins!');
			return;
		}
		setPurchased((prev) => ({ ...prev, [boost.key]: Date.now() + boost.duration }));
		if (onPurchase) onPurchase(boost.key);
	};

		return (
			<div className={styles.centerContent}>
				<h2>Boosts</h2>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
					{BOOSTS.map((boost) => (
						<div key={boost.key} style={{ border: '1px solid #ccc', borderRadius: 12, padding: 16, minWidth: 220, background: '#fff', position: 'relative' }}>
							<img src={boost.icon} alt={boost.name} style={{ width: 38, position: 'absolute', top: 12, right: 12, opacity: 0.85 }} />
							<h3>{boost.name}</h3>
							<p>{boost.description}</p>
							<p>Price: <b>{boost.price}</b> coins</p>
							{purchased[boost.key] && purchased[boost.key] > Date.now() ? (
								<span style={{ color: 'green' }}>Active ({Math.ceil((purchased[boost.key] - Date.now()) / 60000)} min left)</span>
							) : (
								<button onClick={() => handlePurchase(boost)} disabled={coinCount < boost.price}>
									Purchase
								</button>
							)}
						</div>
					))}
				</div>
			</div>
		);
};

export default Boosts;
