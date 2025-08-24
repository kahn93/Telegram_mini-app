import React, { useState } from 'react';
import { logEvent } from '../analytics';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { RECEIVER_WALLET } from '../Database/tonWallet';
import LeaderboardMini from '../ArcadeGames/LeaderboardMini';
import '../ArcadeGames/GameStyles.css';

type SlotSymbol = { icon: string; color: string; payout: number };
const SYMBOLS: SlotSymbol[] = [
  { icon: '🍒', color: '#e74c3c', payout: 2 },
  { icon: '🍋', color: '#f1c40f', payout: 3 },
  { icon: '🔔', color: '#f39c12', payout: 5 },
  { icon: '💎', color: '#00bfff', payout: 10 },
  { icon: '7️⃣', color: '#e67e22', payout: 20 },
  { icon: '⭐', color: '#f9e79f', payout: 15 },
  { icon: '🍀', color: '#27ae60', payout: 8 },
];

const REELS = 3;
const ROWS = 3;
const BONUS_CHANCE = 0.1; // 10% chance for bonus game
const BONUS_MULTIPLIER = 5;


const getRandomSymbol = (): SlotSymbol => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
const getRandomReel = (): SlotSymbol[] => Array.from({ length: ROWS }, getRandomSymbol);
const getInitialReels = (): SlotSymbol[][] => Array.from({ length: REELS }, getRandomReel);

function checkWin(reels: SlotSymbol[][]) {
  // Check horizontal lines
  let win = 0;
  const winLines: number[] = [];
  for (let row = 0; row < ROWS; row++) {
    const symbol = reels[0][row].icon;
    if (reels.every((reel) => reel[row].icon === symbol)) {
      win += SYMBOLS.find((s) => s.icon === symbol)?.payout || 0;
      winLines.push(row);
    }
  }
  // Check diagonal
  if (reels[0][0].icon === reels[1][1].icon && reels[1][1].icon === reels[2][2].icon) {
    win += SYMBOLS.find((s) => s.icon === reels[0][0].icon)?.payout || 0;
    winLines.push(3);
  }
  if (reels[0][2].icon === reels[1][1].icon && reels[1][1].icon === reels[2][0].icon) {
    win += SYMBOLS.find((s) => s.icon === reels[0][2].icon)?.payout || 0;
    winLines.push(4);
  }
  return { win, winLines };
}

interface SlotMachineProps {
  userId: string;
  coinBalance: number;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  onScore: (score: number) => void;
  onBack: () => void;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ userId, coinBalance, onDeposit, onWithdraw, onScore, onBack }) => {
  const [reels, setReels] = useState(getInitialReels());
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');
  const [bet, setBet] = useState(10);
  const [bonus, setBonus] = useState(false);
  // Removed unused bonusWin state
  const [winLines, setWinLines] = useState<number[]>([]);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositTx, setDepositTx] = useState<string | null>(null);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState('');
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const canSpin = coinBalance >= bet && !spinning;

  const handleSpin = async () => {
    if (!canSpin) return;
    setSpinning(true);
    setMessage('Spinning...');
    setMessageType('info');
    setWinLines([]);
    // Log spin event
    const userId = localStorage.getItem('userId') || 'unknown';
    await logEvent(userId, 'arcade_spin', { game: 'SlotMachine', bet });
    setTimeout(() => {
      // Randomize reels
      const newReels = Array.from({ length: REELS }, getRandomReel);
      setReels(newReels);
      // Check win
      const { win, winLines } = checkWin(newReels);
      setWinLines(winLines);
      const totalWin = win * bet;
      let msg = '';
      let type: 'success' | 'error' = 'error';
      if (win > 0) {
        msg = `You win ${totalWin} coins!`;
        type = 'success';
        onScore(totalWin);
        logEvent(userId, 'arcade_win', { game: 'SlotMachine', win: totalWin });
      } else {
        msg = 'No win. Try again!';
        type = 'error';
      }
      // Bonus game
      if (Math.random() < BONUS_CHANCE) {
        setBonus(true);
        setTimeout(() => {
          const bonusWinAmount = Math.floor(Math.random() * 10 + 1) * BONUS_MULTIPLIER * bet;
          setMessage(`Bonus Game! You won ${bonusWinAmount} coins!`);
          setMessageType('success');
          onScore(bonusWinAmount);
          logEvent(userId, 'arcade_bonus', { game: 'SlotMachine', bonus: bonusWinAmount });
          setBonus(false);
        }, 1200);
      } else {
        setMessage(msg);
        setMessageType(type);
      }
      setSpinning(false);
    }, 1200);
    onWithdraw(bet);
  };

  // Deposit TON to get coins
  const handleDeposit = async () => {
    if (!wallet) {
      setMessage('Please connect your TON wallet first.');
      setMessageType('error');
      return;
    }
    setDepositLoading(true);
    setMessage('Awaiting TON payment...');
    setMessageType('info');
  try {
      // 0.1 TON = 100 coins (example rate)
      const tonAmount = 0.1;
      const coinAmount = 100;
      const tx = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
          {
            address: RECEIVER_WALLET,
            amount: (tonAmount * 1e9).toString(),
          },
        ],
      });
      setDepositTx(tx.boc || '');
      // Call Supabase Edge Function to verify payment
      const userId = wallet.account.address;
      // tx.boc is not the tx hash, but for demo, use as identifier (in production, get tx hash from wallet or explorer)
      const verifyRes = await fetch('/functions/v1/ton-payment-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: tx.boc, userId, amountTon: tonAmount }),
      });
      const verifyData = await verifyRes.json();
      if (verifyData.ok) {
        onDeposit(coinAmount);
        setMessage(`Deposit verified! +${coinAmount} coins.`);
        setMessageType('success');
        // Log deposit event
        await logEvent(wallet.account.address, 'arcade_deposit', { game: 'SlotMachine', tonAmount, coinAmount });
      } else {
        setMessage('Deposit not verified. Please contact support.');
        setMessageType('error');
      }
    } catch (e: unknown) {
      let msg = 'Deposit cancelled or failed.';
      if (typeof e === 'object' && e && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
        msg += `\n${(e as { message: string }).message}`;
      }
  setMessage(msg);
  setMessageType('error');
    }
  setDepositLoading(false);
  };

  // Withdraw coins for TON (UI only, backend trigger to be implemented)
  const handleWithdraw = async () => {
    if (!withdrawAddress) {
      setWithdrawMsg('Enter your TON wallet address.');
      setMessageType('error');
      return;
    }
    setWithdrawLoading(true);
    setWithdrawMsg('Processing withdrawal...');
    setMessageType('info');
  try {
      // 100 coins = 0.1 TON (example rate)
      const coinAmount = 100;
      const tonAmount = 0.1;
      // In production: userId should be Telegram userId or Supabase userId
      const userId = wallet?.account?.address || 'unknown';
      const res = await fetch('/functions/v1/ton-withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, withdrawAddress, coinAmount, tonAmount }),
      });
      const data = await res.json();
      if (data.ok) {
        setWithdrawMsg('Withdrawal request accepted! TON will be sent soon.');
        setMessageType('success');
        onWithdraw(coinAmount);
        // Log withdraw event
        await logEvent(userId, 'arcade_withdraw', { game: 'SlotMachine', tonAmount, coinAmount, withdrawAddress });
      } else {
        setWithdrawMsg('Withdrawal failed: ' + (data.error || 'Unknown error'));
        setMessageType('error');
      }
    } catch (e: unknown) {
      let msg = 'Withdrawal failed.';
      if (typeof e === 'object' && e && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
        msg += `\n${(e as { message: string }).message}`;
      }
      setWithdrawMsg(msg);
      setMessageType('error');
    }
    setWithdrawLoading(false);
  };

  return (
    <div style={{ background: '#222', borderRadius: 16, padding: 24, color: '#fff', boxShadow: '0 0 24px #f39c12', maxWidth: 400, margin: '0 auto', position: 'relative' }}>
      <button onClick={onBack} style={{ position: 'absolute', left: 16, top: 16, background: '#fff', color: '#f39c12', border: 'none', borderRadius: 8, padding: '2px 10px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 4px #000' }}>← Back</button>
      <h2 style={{ color: '#f39c12', textShadow: '0 0 8px #fff' }}>🎰 Slot Machine</h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 600, color: '#fff' }}>User ID:</span> <span style={{ marginLeft: 8, color: '#f9e79f' }}>{userId}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 600, color: '#fff' }}>Balance:</span> <span style={{ marginLeft: 8, color: '#00ff99' }}>{coinBalance}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <TonConnectButton style={{ marginBottom: 8 }} />
        <button onClick={handleDeposit} disabled={depositLoading} style={{ background: '#27ae60', color: '#fff', borderRadius: 8, padding: '4px 12px', border: 'none', fontWeight: 600, marginBottom: 4 }}>
          {depositLoading ? 'Processing...' : 'Deposit 0.1 TON → 100 coins'}
        </button>
        {depositTx && <div style={{ color: '#00ff99', fontSize: 10 }}>Tx sent!</div>}
        <div style={{ marginTop: 8, width: '100%' }}>
          <input
            type="text"
            placeholder="Your TON wallet address"
            value={withdrawAddress}
            onChange={e => setWithdrawAddress(e.target.value)}
            style={{ width: 220, borderRadius: 4, padding: 4, marginRight: 8 }}
            disabled={withdrawLoading}
          />
          <button onClick={handleWithdraw} disabled={withdrawLoading || !coinBalance} style={{ background: '#c0392b', color: '#fff', borderRadius: 8, padding: '4px 12px', border: 'none', fontWeight: 600 }}>
            {withdrawLoading ? 'Processing...' : 'Withdraw 100 coins → 0.1 TON'}
          </button>
          {withdrawMsg && <div style={{ color: '#00ff99', fontSize: 10 }}>{withdrawMsg}</div>}
        </div>
      </div>
  <div style={{ background: '#111', borderRadius: 12, padding: 12, margin: '16px 0', boxShadow: '0 0 12px #f39c12 inset', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {reels.map((reel, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {reel.map((symbol, j) => (
                <div key={j} style={{
                  width: 48, height: 48, fontSize: 32, background: winLines.includes(j) ? '#f9e79f' : symbol.color,
                  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: winLines.includes(j) ? '0 0 16px #fff' : '0 0 8px #000', border: '2px solid #fff', transition: 'background 0.3s, box-shadow 0.3s',
                  animation: spinning ? 'spin 0.6s linear infinite' : undefined
                }}>{symbol.icon}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ margin: '8px 0', color: '#fff', fontWeight: 600 }}>Bet: <input type="number" min={1} max={coinBalance} value={bet} onChange={e => setBet(Math.max(1, Math.min(coinBalance, Number(e.target.value))))} style={{ width: 60, borderRadius: 4, padding: 2 }} /></div>
        <button onClick={handleSpin} disabled={!canSpin} style={{ background: '#f39c12', color: '#fff', borderRadius: 12, padding: '8px 32px', fontWeight: 700, fontSize: 20, boxShadow: '0 0 16px #f9e79f', border: 'none', marginTop: 8, cursor: canSpin ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}>
          {spinning ? 'Spinning...' : 'SPIN'}
        </button>
        {bonus && <div style={{ color: '#00ff99', fontWeight: 700, fontSize: 18, marginTop: 8, textShadow: '0 0 8px #fff' }}>BONUS GAME!</div>}
        <div
          style={{
            marginTop: 12,
            minHeight: 24,
            color:
              messageType === 'success'
                ? '#00ff99'
                : messageType === 'error'
                ? '#ff4d4f'
                : '#fff',
            fontWeight: 600,
            textShadow:
              messageType === 'success'
                ? '0 0 8px #00ff99'
                : messageType === 'error'
                ? '0 0 8px #ff4d4f'
                : undefined,
            animation:
              messageType === 'success' && message
                ? 'popSuccess 0.5s'
                : messageType === 'error' && message
                ? 'popError 0.5s'
                : undefined,
            transition: 'color 0.2s, text-shadow 0.2s',
          }}
        >
          {message}
        </div>
        <style>{`
          @keyframes popSuccess {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          @keyframes popError {
            0% { transform: scale(1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
      <LeaderboardMini game="SlotMachine" />
      <style>{`
        @keyframes spin {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SlotMachine;
