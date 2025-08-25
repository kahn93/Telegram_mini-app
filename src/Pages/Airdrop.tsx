

import React, { useState } from 'react';

import { logEvent } from '../analytics';
import { guardianAngelAirdrop } from '../Database/edgeFunctions';
import giftImg from '../assets/gift.png';
import crownImg from '../assets/crown.png';
import questImg from '../assets/quest.png';
import cdollarImg from '../assets/cdollar.png';
import styles from './Airdrop.module.scss';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { RECEIVER_WALLET } from '../Database/tonWallet';


const Airdrop: React.FC = () => {
	const [amount, setAmount] = useState('');
	const [txStatus, setTxStatus] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [tonConnectUI] = useTonConnectUI();


	const handleDonate = async () => {
		setTxStatus(null);
		if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
			setTxStatus('Please enter a valid TON amount.');
			return;
		}
		setLoading(true);
		try {
			await tonConnectUI.sendTransaction({
				validUntil: Math.floor(Date.now() / 1000) + 360,
				messages: [
					{
						address: RECEIVER_WALLET,
						amount: (Number(amount) * 1e9).toString(), // TON to nanoTON
					},
				],
			});
			setTxStatus('✅ Thank you for your donation!');
			setAmount('');
			// Log analytics event and backend airdrop
			const userId = localStorage.getItem('userId') || 'unknown';
			await guardianAngelAirdrop({ userId, amount: Number(amount) });
			await logEvent(userId, 'airdrop_donation', { amountTon: Number(amount) });
		} catch (e: unknown) {
			let msg = 'Transaction cancelled or failed.';
			if (typeof e === 'object' && e && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
				msg += `\n${(e as { message: string }).message}`;
			}
			setTxStatus(msg);
		}
		setLoading(false);
	};

		return (
			<div className={styles.airdropBg}>
				<div className={styles.airdropContainer}>
					<div className={styles.headerSection}>
						<img src={giftImg} alt="Airdrop" className={styles.headerIcon} />
						<h2 className={styles.title}>Airdrop & Charity</h2>
						<p className={styles.subtitle}>Connect your TON wallet and become a Guardian Angel!<br />
							<span className={styles.highlight}>Donate any amount of TON to charity and help create a better tomorrow.</span>
						</p>
					</div>
					<div className={styles.walletSection}>
						<TonConnectButton className={styles.tonBtn} />
					</div>
					<div className={styles.donateCard}>
						<div className={styles.donateTitle}>
							<img src={crownImg} alt="Guardian Angel" className={styles.donateIcon} />
							<span>Become a Guardian Angel</span>
						</div>
						<div className={styles.donateDesc}>
							Enter the amount of TON you wish to donate. Every contribution makes a difference!
						</div>
						<div className={styles.inputRow}>
										<input
											type="number"
											min="0"
											step="0.01"
											placeholder="Amount (TON)"
											value={amount}
											onChange={e => setAmount(e.target.value)}
											className={styles.input}
											aria-label="Donation amount in TON"
											tabIndex={0}
											style={{ outline: 'none', boxShadow: '0 0 0 2px #24308a33', transition: 'box-shadow 0.2s' }}
											onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px #24308a'}
											onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 2px #24308a33'}
										/>
										<button
											onClick={handleDonate}
											className={styles.donateBtn}
											disabled={loading}
											aria-label="Donate TON to charity"
											tabIndex={0}
											style={{ outline: 'none', boxShadow: '0 0 0 2px #24308a33', transition: 'box-shadow 0.2s' }}
											onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleDonate(); }}
											onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px #24308a'}
											onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 2px #24308a33'}
										>
											{loading ? 'Processing...' : 'Donate'}
										</button>
						</div>
									{txStatus && (
										<div className={txStatus.startsWith('✅') ? styles.success : styles.error} style={txStatus.startsWith('✅') ? { animation: 'popSuccess 0.5s' } : {}}>{txStatus}
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
					<div className={styles.effectsSection}>
						<h3 className={styles.effectsTitle}>Airdrop Effects</h3>
						<div className={styles.effectsGrid}>
							<div className={styles.effectCard}>
								<img src={questImg} alt="Boost" className={styles.effectIcon} />
								<div className={styles.effectName}>Boosts</div>
								<div className={styles.effectDesc}>Special boosts for all donors during airdrop events.</div>
							</div>
							<div className={styles.effectCard}>
								<img src={cdollarImg} alt="Rewards" className={styles.effectIcon} />
								<div className={styles.effectName}>Exclusive Rewards</div>
								<div className={styles.effectDesc}>Unlock unique in-game rewards and badges for your generosity.</div>
							</div>
							<div className={styles.effectCard}>
								<img src={crownImg} alt="Leaderboard" className={styles.effectIcon} />
								<div className={styles.effectName}>Charity Leaderboard</div>
								<div className={styles.effectDesc}>Top donors are featured on the Guardian Angel leaderboard.</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
};

export default Airdrop;
