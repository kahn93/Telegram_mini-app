import * as React from 'react';
import { useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import './GameStyles.css';
import { playSound, isMuted } from '../soundManager';

// Unique theme: Ancient Egypt Slot Machine
const SYMBOLS = [
  { icon: '🦂', color: '#e1b12c', payout: 3 },
  { icon: '🐍', color: '#44bd32', payout: 5 },
  { icon: '👑', color: '#fbc531', payout: 8 },
  { icon: '🦅', color: '#273c75', payout: 12 },
  { icon: '💎', color: '#00a8ff', payout: 20 },
  { icon: '⚱️', color: '#718093', payout: 15 },
  { icon: '🦚', color: '#9c88ff', payout: 25 },
];

const REELS = 3;
const ROWS = 3;
const BONUS_CHANCE = 0.13;
const BONUS_MULTIPLIER = 6;

type SymbolType = { icon: string; color: string; payout: number };
const getRandomSymbol = (): SymbolType => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
const getRandomReel = (): SymbolType[] => Array.from({ length: ROWS }, getRandomSymbol);
const getInitialReels = (): SymbolType[][] => Array.from({ length: REELS }, getRandomReel);

function checkWin(reels: SymbolType[][]): { win: number; winLines: number[] } {
  let win = 0;
  const winLines: number[] = [];
  for (let row = 0; row < ROWS; row++) {
    const symbol = reels[0][row].icon;
    if (reels.every((reel: SymbolType[]) => reel[row].icon === symbol)) {
      win += SYMBOLS.find((s) => s.icon === symbol)?.payout || 0;
      winLines.push(row);
    }
  }
  // Diagonals
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


interface SlotMachine3Props {
  userId?: string;
  onBack: () => void;
  muted?: boolean;
}

const SlotMachine3: React.FC<SlotMachine3Props> = ({ userId: propUserId, onBack, muted }) => {
  // Try to get Telegram WebApp userId if not provided
  const [userId, setUserId] = React.useState<string>(propUserId || '');
  React.useEffect(() => {
    if (!propUserId) {
      try {
        const tg = (window as Window & { Telegram?: { WebApp?: { initDataUnsafe?: { user?: { id?: number } } } } }).Telegram?.WebApp;
        if (tg && tg.initDataUnsafe?.user?.id) {
          setUserId(tg.initDataUnsafe.user.id.toString());
        }
      } catch {
        // Ignore errors if Telegram WebApp is not available
      }
    }
  }, [propUserId]);
  const [reels, setReels] = useState(getInitialReels());
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');
  const [bet, setBet] = useState(10);
  const [coinBalance, setCoinBalance] = useState(500);
  const [bonus, setBonus] = useState(false);
  const [winLines, setWinLines] = useState<number[]>([]);
  const [showWinEffect, setShowWinEffect] = useState(false);
  const [showBonusEffect, setShowBonusEffect] = useState(false);

  const canSpin = coinBalance >= bet && !spinning;

  const handleSpin = () => {
    if (!canSpin) return;
    if (!muted && !isMuted()) playSound('spin');
    setSpinning(true);
    setMessage('Spinning...');
    setMessageType('info');
    setWinLines([]);
    setTimeout(() => {
      const newReels = Array.from({ length: REELS }, getRandomReel);
      setReels(newReels);
      const { win, winLines } = checkWin(newReels);
      setWinLines(winLines);
      const totalWin = win * bet;
      let msg = '';
      let type: 'success' | 'error' = 'error';
      if (win > 0) {
        msg = `You win ${totalWin} coins!`;
        type = 'success';
        setCoinBalance((b) => b + totalWin);
        setShowWinEffect(true);
        if (!muted && !isMuted()) playSound('win');
        setTimeout(() => setShowWinEffect(false), 1200);
      } else {
        msg = 'No win. Try again!';
        type = 'error';
      }
      // Bonus game
      if (Math.random() < BONUS_CHANCE) {
        setBonus(true);
        setShowBonusEffect(true);
        if (!muted && !isMuted()) playSound('bonus');
        setTimeout(() => {
          const bonusWinAmount = Math.floor(Math.random() * 10 + 1) * BONUS_MULTIPLIER * bet;
          setMessage(`Bonus! You won ${bonusWinAmount} coins!`);
          setMessageType('success');
          setCoinBalance((b) => b + bonusWinAmount);
          setBonus(false);
          setShowBonusEffect(false);
        }, 1200);
      } else {
        setMessage(msg);
        setMessageType(type);
      }
      setSpinning(false);
      setCoinBalance((b) => b - bet);
    }, 1200);
  };

  return (
    <div
      style={{
        background: 'radial-gradient(ellipse at 60% 40%, #f5e6c4 70%, #e1b12c 100%)',
        borderRadius: 20,
        padding: 28,
        color: '#222',
        boxShadow: '0 0 32px #e1b12c',
        maxWidth: 420,
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background particles (gold dust) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        {[...Array(16)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 8 + Math.random() * 8,
            height: 8 + Math.random() * 8,
            borderRadius: '50%',
            background: `linear-gradient(135deg,#e1b12c,#fbc531,#fffbe6)`,
            opacity: 0.13 + Math.random() * 0.18,
            filter: 'blur(1.5px)',
            animation: `floatGold 7s ${Math.random() * 4}s infinite alternate`,
          }} />
        ))}
        <style>{`
          @keyframes floatGold {
            0% { transform: translateY(0); }
            100% { transform: translateY(-30px); }
          }
        `}</style>
      </div>
      <button
        onClick={() => {
          if (!muted && !isMuted()) playSound('button');
          onBack();
        }}
        style={{
          position: 'absolute',
          left: 16,
          top: 16,
          background: 'linear-gradient(135deg,#fff,#e1b12c)',
          color: '#e1b12c',
          border: 'none',
          borderRadius: 10,
          padding: '4px 14px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 0 6px #e1b12c',
          fontSize: 18,
          zIndex: 2,
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseDown={e => e.currentTarget.style.background = '#e1b12c'}
        onMouseUp={e => e.currentTarget.style.background = 'linear-gradient(135deg,#fff,#e1b12c)'}
      >
        ← Back
      </button>
      <h2 style={{ color: '#e1b12c', textShadow: '0 0 12px #44bd32', fontSize: 32, marginBottom: 8, zIndex: 2, position: 'relative' }}>
        👑 Egypt Slot
      </h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, zIndex: 2, position: 'relative' }}>
        <span style={{ fontWeight: 600, color: '#222' }}>User ID:</span> <span style={{ marginLeft: 8, color: '#44bd32' }}>{userId || 'Not connected'}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, zIndex: 2, position: 'relative' }}>
        <span style={{ fontWeight: 600, color: '#222' }}>Balance:</span> <span style={{ marginLeft: 8, color: '#00a8ff' }}>{coinBalance}</span>
      </div>
      <div style={{ background: '#f7d794', borderRadius: 14, padding: 14, margin: '18px 0', boxShadow: '0 0 18px #e1b12c inset', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          {reels.map((reel, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {reel.map((symbol, j) => (
                <div key={j} style={{
                  width: 54,
                  height: 54,
                  fontSize: 36,
                  background: winLines.includes(j) ? '#fbc531' : symbol.color,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: winLines.includes(j) ? '0 0 18px #fff' : '0 0 10px #000',
                  border: '2.5px solid #fff',
                  transition: 'background 0.3s, box-shadow 0.3s',
                  animation: spinning ? 'spin 0.6s linear infinite' : undefined,
                  filter: showWinEffect && winLines.includes(j) ? 'drop-shadow(0 0 16px #fbc531)' : undefined,
                }}>{symbol.icon}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ margin: '10px 0', color: '#222', fontWeight: 600, fontSize: 18 }}>
          Bet: <input type="number" min={1} max={coinBalance} value={bet} onChange={e => setBet(Math.max(1, Math.min(coinBalance, Number(e.target.value))))} style={{ width: 60, borderRadius: 6, padding: 4, fontSize: 18 }} />
        </div>
        <button
          onClick={() => {
            if (!muted && !isMuted()) playSound('button');
            handleSpin();
          }}
          onTouchStart={() => {
            if (!muted && !isMuted()) playSound('button');
            handleSpin();
          }}
          disabled={!canSpin}
          style={{
            background: canSpin ? 'linear-gradient(135deg,#e1b12c,#fbc531,#fffbe6)' : '#ccc',
            color: canSpin ? '#222' : '#888',
            borderRadius: 14,
            padding: '10px 38px',
            fontWeight: 800,
            fontSize: 24,
            boxShadow: canSpin ? '0 0 18px #e1b12c' : 'none',
            border: 'none',
            marginTop: 10,
            cursor: canSpin ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s, color 0.2s',
            zIndex: 2,
          }}
          onMouseDown={e => e.currentTarget.style.background = '#e1b12c'}
          onMouseUp={e => e.currentTarget.style.background = 'linear-gradient(135deg,#e1b12c,#fbc531,#fffbe6)'}
        >
          {spinning ? 'Spinning...' : 'SPIN'}
        </button>
        {bonus && <div style={{ color: '#44bd32', fontWeight: 800, fontSize: 22, marginTop: 10, textShadow: '0 0 12px #fff', letterSpacing: 1 }}>BONUS!</div>}
        {/* Win effect animation */}
        {showWinEffect && (
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '30%',
            transform: 'translate(-50%, -50%)',
            color: '#fbc531',
            fontWeight: 900,
            fontSize: 38,
            textShadow: '0 0 24px #fff, 0 0 32px #fbc531',
            pointerEvents: 'none',
            zIndex: 10,
            animation: 'popSuccess 1.1s',
          }}>
            🎉 WIN!
          </div>
        )}
        {/* Bonus effect animation */}
        {showBonusEffect && (
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '60%',
            transform: 'translate(-50%, -50%)',
            color: '#fbc531',
            fontWeight: 900,
            fontSize: 34,
            textShadow: '0 0 24px #fff, 0 0 32px #fbc531',
            pointerEvents: 'none',
            zIndex: 10,
            animation: 'popBonus 1.1s',
          }}>
            ✨ BONUS ✨
          </div>
        )}
        <div
          style={{
            marginTop: 14,
            minHeight: 28,
            color:
              messageType === 'success'
                ? '#44bd32'
                : messageType === 'error'
                ? '#c23616'
                : '#222',
            fontWeight: 700,
            fontSize: 18,
            textShadow:
              messageType === 'success'
                ? '0 0 10px #44bd32'
                : messageType === 'error'
                ? '0 0 10px #c23616'
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
          @keyframes popBonus {
            0% { opacity: 0; transform: scale(0.7); }
            30% { opacity: 1; transform: scale(1.2); }
            80% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.8); }
          }
          @keyframes spin {
            0% { transform: rotateX(0deg); }
            100% { transform: rotateX(360deg); }
          }
        `}</style>
      </div>
      <LeaderboardMini game="SlotMachine3" />
    </div>
  );
};

export default SlotMachine3;
