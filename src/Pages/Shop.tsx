import { useState } from 'react';



import styles from './Shop.module.scss';

import { logEvent } from '../analytics';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { RECEIVER_WALLET } from '../Database/tonWallet';
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
	purchased: { [key: string]: boolean };
}


const Shop: React.FC<ShopProps> = ({ onPurchase, purchased }) => {
	const [txStatus, setTxStatus] = useState<string | null>(null);
	const [loading, setLoading] = useState<string | null>(null); // item label if loading
	const [tonConnectUI] = useTonConnectUI();
	const [walletWarning, setWalletWarning] = useState<string | null>(null);



		// Purchase handler
		const handlePurchase = async (item: { label: string; price: number; value?: number; effect?: string }) => {
			setTxStatus(null);
			setWalletWarning(null);
			setLoading(item.label);
			try {
				// Check if wallet is connected
				if (!tonConnectUI.account) {
					setWalletWarning('Please connect your TON wallet before making a purchase.');
					setLoading(null);
					return;
				}
				await tonConnectUI.sendTransaction({
					validUntil: Math.floor(Date.now() / 1000) + 360,
					messages: [
						{
							address: RECEIVER_WALLET,
							amount: (item.price * 1e9).toString(), // TON to nanoTON
						},
					],
				});
				setTxStatus(`✅ Purchase successful: ${item.label}`);
				onPurchase(item);
				// Log analytics event
				const userId = localStorage.getItem('userId') || 'unknown';
				await logEvent(userId, 'shop_purchase', { item: item.label, price: item.price });
			} catch (e: unknown) {
				let msg = 'Transaction cancelled or failed.';
				if (typeof e === 'object' && e && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
					msg += `\n${(e as { message: string }).message}`;
				}
				setTxStatus(msg);
			}
			setLoading(null);
		};

			return (
				<div className={styles.shopContainer}>
					{/* Shop title removed as requested */}
											<div className={styles.shopAbsoluteLayout} style={{ width: 600, height: 600, position: 'relative', margin: '0 auto' }}>
												{(() => {
													// Use latest exported layout from LayoutEditor
													// Organize items into two columns, starting at the top edge and stopping above wallet connect button
													// Center all items horizontally and shift up a bit
													const itemWidth = 152, itemHeight = 15;
													const centerX = (600 - itemWidth) / 2; // 600 is container width
													const startY = 20 - 32; // shift up by 1 grid block (32px)
													const gapY = 32; // vertical gap between items
													const itemCount = shopItems.length;
													const itemPositions = Array.from({ length: itemCount }, (_, i) => {
														let shift = 64; // default shift: 2 grid blocks
																// Shift all items up by an additional half grid block (16px)
																	if (i === 0) shift = 96 + 32; // 3 grid blocks + 2 halfs
																	else if (i === 1) shift = 64 + 32; // 2 grid blocks + 2 halfs
																	else if (i === 2) shift = 32 + 32 + 8; // 1 grid block + 2 halfs + 8px up
																	else shift += 16; // all other items, add 16px
														// Move the fourth and below down by half a grid block (16px) each
														let down = 0;
														if (i >= 3) down = (i - 2) * 16;
														return {
															x: centerX,
															y: startY + i * gapY - shift + down,
															width: itemWidth,
															height: itemHeight,
														};
													});
															return shopItems.map((item, idx) => {
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
															});
												})()}
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
			);
};

export default Shop;
