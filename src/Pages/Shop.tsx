import { useState, useEffect } from 'react';



import styles from './Shop.module.scss';

import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import coinIcon from '../assets/cdollar.png';
import energyIcon from '../assets/ewallet.png';
import autoClickerIcon from '../assets/turbo.png';
import refillIcon from '../assets/ewallet.png';
import goldenTapIcon from '../assets/button.png';


// Flat array of all purchasable items (no categories)
const shopItems = [
	{ label: '1.2x Coin Mult', value: 1.2, price: 0.3, icon: coinIcon, desc: '+20%/tap' },
	{ label: '1.5x Coin Mult', value: 1.5, price: 0.7, icon: coinIcon, desc: '+50%/tap' },
	{ label: '2x Coin Mult', value: 2, price: 1.2, icon: coinIcon, desc: '2x/tap' },
	{ label: '3x Coin Mult', value: 3, price: 2.5, icon: coinIcon, desc: '3x/tap' },
	{ label: '5x Coin Mult', value: 5, price: 5, icon: coinIcon, desc: '5x/tap' },
	{ label: '1.2x Energy Mult', value: 1.2, price: 0.3, icon: energyIcon, desc: '+20% energy' },
	{ label: '1.5x Energy Mult', value: 1.5, price: 0.7, icon: energyIcon, desc: '+50% energy' },
	{ label: '2x Energy Mult', value: 2, price: 1.2, icon: energyIcon, desc: '2x energy' },
	{ label: '3x Energy Mult', value: 3, price: 2.5, icon: energyIcon, desc: '3x energy' },
	{ label: '5x Energy Mult', value: 5, price: 5, icon: energyIcon, desc: '5x energy' },
	{ label: 'Auto Clicker', desc: 'Auto 1hr', price: 0.5, effect: 'autoclicker', icon: autoClickerIcon },
	{ label: 'Energy Refill', desc: 'Full energy', price: 0.4, effect: 'refill', icon: refillIcon },
	{ label: 'Golden Tap', desc: '+100/tap', price: 2.5, effect: 'goldentap', icon: goldenTapIcon },
];

interface ShopProps {
	onPurchase: (item: { label: string; value?: number; effect?: string }) => void;
}

const Shop: React.FC<ShopProps> = ({ onPurchase }) => {
	const [tab, setTab] = useState<'shop'>('shop');
	const [txStatus, setTxStatus] = useState<string | null>(null);
	const [loading, setLoading] = useState<string | null>(null); // item label if loading
	const [tonConnectUI] = useTonConnectUI();
	const [walletWarning, setWalletWarning] = useState<string | null>(null);
	const [purchased, setPurchased] = useState<{ [key: string]: boolean }>(() => {
		try {
			return JSON.parse(localStorage.getItem('purchasedItems') || '{}');
		} catch {
			return {};
		}
	});

	useEffect(() => {
		localStorage.setItem('purchasedItems', JSON.stringify(purchased));
	}, [purchased]);

	// Purchase handler
	const handlePurchase = (item: { label: string; value?: number; effect?: string }) => {
		onPurchase(item);
	};

	const itemWidth = 152, itemHeight = 15;
	const centerX = (600 - itemWidth) / 2;
	const startY = 20 - 32;
	const gapY = 32;
	const itemCount = shopItems.length;
	const itemPositions = Array.from({ length: itemCount }, (_, i) => {
		let shift = 64;
		if (i === 0) shift = 96 + 32;
		else if (i === 1) shift = 64 + 32;
		else if (i === 2) shift = 32 + 32 + 8;
		else shift += 16;
		let down = 0;
		if (i >= 3) down = (i - 2) * 16;
		return {
			x: centerX,
			y: startY + i * gapY - shift + down,
			width: itemWidth,
			height: itemHeight,
		};
	});

	return (
		<div>
			<div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
				<button onClick={() => setTab('shop')} style={{ fontWeight: tab === 'shop' ? 700 : 400, background: tab === 'shop' ? '#ffe259' : '#fff', borderRadius: 6, padding: '4px 16px', border: '1px solid #eee' }}>Shop</button>
			</div>
			{tab === 'shop' && (
				<div className={styles.shopContainer}>
					<div className={styles.shopAbsoluteLayout} style={{ width: 600, height: 600, position: 'relative', margin: '0 auto' }}>
						{shopItems.map((item, idx) => {
							const pos = itemPositions[idx] || { x: 0, y: 0, width: 100, height: 50 };
							return (
								<div
									key={item.label}
									className={styles.shopItemAbsolute}
									style={{
										position: 'absolute',
										left: pos.x,
										top: pos.y,
										width: pos.width,
										height: pos.height,
										boxSizing: 'border-box',
										background: 'none',
									}}
								>
									<img src={item.icon} alt={item.label} style={{ width: 24, height: 24, marginRight: 8 }} />
									<div>
										<div style={{ fontWeight: 700, color: '#000' }}>{item.label}</div>
										<div style={{ fontSize: '0.85em', color: '#000' }}>{item.desc}</div>
									</div>
									<div style={{ fontWeight: 700, color: '#000', marginLeft: 8 }}>{item.price} TON</div>
									<button
										className={styles.shopBuyBtn}
										onClick={() => handlePurchase(item)}
										disabled={!!purchased[item.label] || loading === item.label}
									>
										{loading === item.label ? '...' : purchased[item.label] ? 'Owned' : 'Buy'}
									</button>
								</div>
							);
						})}
					</div>
					<div className={styles.shopActions}>
						<TonConnectButton />
					</div>
					{walletWarning && (
						<div style={{ color: 'red', fontWeight: 600, margin: '8px 0' }}>{walletWarning}</div>
					)}
					{txStatus && (
						<div style={{
							animation: txStatus.startsWith('✅') ? 'popSuccess 0.5s' : undefined
						}}>{txStatus}</div>
					)}
					<style>{`
						@keyframes popSuccess {
							0% { transform: scale(0.8); opacity: 0.5; }
							60% { transform: scale(1.1); opacity: 1; }
							100% { transform: scale(1); opacity: 1; }
						}
					`}</style>
				</div>
			)}
		</div>
	);
};

export default Shop;
