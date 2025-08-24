

import React, { useState } from 'react';

import { logEvent } from '../analytics';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { RECEIVER_WALLET } from '../Database/tonWallet';
import coinIcon from '../assets/cdollar.png';
import energyIcon from '../assets/ewallet.png';
import autoClickerIcon from '../assets/turbo.png';
import refillIcon from '../assets/ewallet.png';
import goldenTapIcon from '../assets/button.png';

// Example item definitions
const coinMultipliers = [
	{ label: '1.2x Coin Mult', value: 1.2, price: 0.3, icon: coinIcon, desc: '+20%/tap' },
	{ label: '1.5x Coin Mult', value: 1.5, price: 0.7, icon: coinIcon, desc: '+50%/tap' },
	{ label: '2x Coin Mult', value: 2, price: 1.2, icon: coinIcon, desc: '2x/tap' },
	{ label: '3x Coin Mult', value: 3, price: 2.5, icon: coinIcon, desc: '3x/tap' },
	{ label: '5x Coin Mult', value: 5, price: 5, icon: coinIcon, desc: '5x/tap' },
];
const energyMultipliers = [
	{ label: '1.2x Energy Mult', value: 1.2, price: 0.3, icon: energyIcon, desc: '+20% energy' },
	{ label: '1.5x Energy Mult', value: 1.5, price: 0.7, icon: energyIcon, desc: '+50% energy' },
	{ label: '2x Energy Mult', value: 2, price: 1.2, icon: energyIcon, desc: '2x energy' },
	{ label: '3x Energy Mult', value: 3, price: 2.5, icon: energyIcon, desc: '3x energy' },
	{ label: '5x Energy Mult', value: 5, price: 5, icon: energyIcon, desc: '5x energy' },
];
// Only keep 3 special items for a cleaner shop
const otherItems = [
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


	// Purchase handler
	const handlePurchase = async (item: { label: string; price: number; value?: number; effect?: string }) => {
		setTxStatus(null);
		setLoading(item.label);
		try {
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
// 			notify({ message: `Purchase successful: ${item.label}`, type: 'success' });
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
				<div style={{
					maxWidth: 420,
					margin: '28px auto',
					padding: 18,
					background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
					borderRadius: 18,
					boxShadow: '0 6px 32px #24308a22',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					transition: 'box-shadow 0.2s',
					animation: 'fadeInShop 0.7s',
				}}>
					<style>{`
						@keyframes fadeInShop {
							from { opacity: 0; transform: translateY(20px); }
							to { opacity: 1; transform: none; }
						}
						.shop-section-title {
							font-size: 1.1rem;
							font-weight: 700;
							color: #24308a;
							margin-bottom: 8px;
							letter-spacing: 0.5px;
						}
					`}</style>
				<h2 style={{ textAlign: 'center', marginBottom: 32, fontWeight: 800, color: '#24308a', letterSpacing: 1 }}>Shop</h2>
						<div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
							<div>
								<div className="shop-section-title">Coin Multipliers</div>
								<ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
									{coinMultipliers.map((item) => (
										<li key={item.label} style={{ width: 80, background: 'rgba(255,255,255,0.15)', borderRadius: 5, boxShadow: '0 1px 2px #24308a08', padding: 3, display: 'flex', alignItems: 'center', gap: 5, transition: 'box-shadow 0.2s, transform 0.2s', animation: 'fadeInShop 0.7s' }}>
											<img src={item.icon} alt="coin" style={{ width: 14, height: 14, borderRadius: 3, background: '#fff' }} />
											<div style={{ flex: 1 }}>
												<div style={{ fontWeight: 700, fontSize: 8 }}>{item.label}</div>
												<div style={{ color: '#888', fontSize: 7 }}>{item.desc}</div>
											</div>
											<div style={{ fontWeight: 700, color: '#24308a', fontSize: 8 }}>{item.price} TON</div>
																<button
																	disabled={!!purchased[item.label] || loading === item.label}
																	onClick={() => handlePurchase(item)}
																	style={{
																		padding: '2px 6px',
																		borderRadius: 3,
																		background: loading === item.label ? '#ffe25988' : '#ffe259',
																		color: '#222',
																		fontWeight: 700,
																		border: 'none',
																		cursor: !!purchased[item.label] || loading === item.label ? 'not-allowed' : 'pointer',
																		fontSize: 7,
																		position: 'relative',
																		outline: 'none',
																		boxShadow: '0 0 0 2px #24308a33',
																		transition: 'box-shadow 0.2s',
																	}}
																	aria-label={`Buy ${item.label}`}
																	tabIndex={0}
																	onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handlePurchase(item); }}
																	onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px #24308a'}
																	onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 2px #24308a33'}
																>
																	{loading === item.label ? (
																		<span style={{ fontSize: 8 }}>Processing...</span>
																	) : purchased[item.label] ? '✓' : 'Buy'}
																</button>
										</li>
									))}
								</ul>
							</div>
							<div>
								<div className="shop-section-title">Energy Multipliers</div>
								<ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
									{energyMultipliers.map((item) => (
										<li key={item.label} style={{ width: 80, background: 'rgba(255,255,255,0.15)', borderRadius: 5, boxShadow: '0 1px 2px #24308a08', padding: 3, display: 'flex', alignItems: 'center', gap: 5, transition: 'box-shadow 0.2s, transform 0.2s', animation: 'fadeInShop 0.7s' }}>
											<img src={item.icon} alt="energy" style={{ width: 14, height: 14, borderRadius: 3, background: '#fff' }} />
											<div style={{ flex: 1 }}>
												<div style={{ fontWeight: 700, fontSize: 8 }}>{item.label}</div>
												<div style={{ color: '#888', fontSize: 7 }}>{item.desc}</div>
											</div>
											<div style={{ fontWeight: 700, color: '#24308a', fontSize: 8 }}>{item.price} TON</div>
																<button
																	disabled={!!purchased[item.label] || loading === item.label}
																	onClick={() => handlePurchase(item)}
																	style={{ padding: '2px 6px', borderRadius: 3, background: loading === item.label ? '#ffe25988' : '#ffe259', color: '#222', fontWeight: 700, border: 'none', cursor: !!purchased[item.label] || loading === item.label ? 'not-allowed' : 'pointer', fontSize: 7, position: 'relative' }}
																>
																	{loading === item.label ? (
																		<span style={{ fontSize: 8 }}>Processing...</span>
																	) : purchased[item.label] ? '✓' : 'Buy'}
																</button>
										</li>
									))}
								</ul>
							</div>
						</div>
						<div style={{ marginTop: 24, width: '100%' }}>
							<div className="shop-section-title">Special Items</div>
							<ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
								{otherItems.map((item) => (
									<li key={item.label} style={{ width: 80, background: 'rgba(255,255,255,0.15)', borderRadius: 5, boxShadow: '0 1px 2px #24308a08', padding: 3, display: 'flex', alignItems: 'center', gap: 5, transition: 'box-shadow 0.2s, transform 0.2s', animation: 'fadeInShop 0.7s' }}>
										<img src={item.icon} alt={item.label} style={{ width: 14, height: 14, borderRadius: 3, background: '#fff' }} />
										<div style={{ flex: 1 }}>
											<div style={{ fontWeight: 700, fontSize: 8 }}>{item.label}</div>
											<div style={{ color: '#888', fontSize: 7 }}>{item.desc}</div>
										</div>
										<div style={{ fontWeight: 700, color: '#24308a', fontSize: 8 }}>{item.price} TON</div>
															<button
																disabled={!!purchased[item.label] || loading === item.label}
																onClick={() => handlePurchase(item)}
																style={{ padding: '2px 6px', borderRadius: 3, background: loading === item.label ? '#ffe25988' : '#ffe259', color: '#222', fontWeight: 700, border: 'none', cursor: !!purchased[item.label] || loading === item.label ? 'not-allowed' : 'pointer', fontSize: 7, position: 'relative' }}
															>
																{loading === item.label ? (
																	<span style={{ fontSize: 8 }}>Processing...</span>
																) : purchased[item.label] ? '✓' : 'Buy'}
															</button>
									</li>
								))}
							</ul>
						</div>
							<TonConnectButton style={{ marginTop: 40 }} />
							<a
								href="https://t.me/LisaToken_bot?game=Lisa"
								target="_blank"
								rel="noopener noreferrer"
								style={{
									display: 'block',
									margin: '24px auto 0',
									background: '#0088cc',
									color: '#fff',
									fontWeight: 700,
									borderRadius: 8,
									padding: '10px 24px',
									textAlign: 'center',
									textDecoration: 'none',
									boxShadow: '0 2px 8px #24308a22',
									fontSize: 16,
									letterSpacing: 1
								}}
							>
								Play on Telegram
							</a>
						{txStatus && (
							<div style={{
								marginTop: 24,
								color: txStatus.startsWith('✅') ? 'green' : 'red',
								fontWeight: 600,
								fontSize: 16,
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
