import * as React from 'react';
import { useState, useEffect } from 'react';
import './GameStyles.css';
import { submitScoreSupabase } from './leaderboardSupabase';
import { playSound, isMuted } from '../soundManager';

// Lightweight Plinko mini-game
const ROWS = 8, COLS = 7;

interface PlinkoProps {
  userid?: string;
  muted?: boolean;
}
const Plinko: React.FC<PlinkoProps> = ({ userid: propUserId, muted }: PlinkoProps) => {
  // Telegram userId auto-detect
  const [userId, setUserId] = useState<string>(propUserId || '');
  React.useEffect(() => {
    if (!propUserId) {
      try {
        const tg = (window as unknown as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: { id?: string | number } } } } }).Telegram?.WebApp;
        if (tg && tg.initDataUnsafe?.user?.id) {
          setUserId(tg.initDataUnsafe.user.id.toString());
        }
      } catch (e) {
        // ignore
      }
    }
  }, [propUserId]);

  const [ballCol, setBallCol] = useState(Math.floor(COLS / 2));
  const [row, setRow] = useState(0);
  const [score, setScore] = useState(() => {
    const stored = localStorage.getItem('plinko_score');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [balls, setBalls] = useState(() => {
    const stored = localStorage.getItem('plinko_balls');
    return stored ? JSON.parse(stored) : [];
  });
  const [plinkoState, setPlinkoState] = useState(() => {
    const stored = localStorage.getItem('plinko_state');
    return stored ? JSON.parse(stored) : {};
  });
  const [gameOver, setGameOver] = useState(false);
  const [showGameOverEffect, setShowGameOverEffect] = useState(false);
  const [showScorePop, setShowScorePop] = useState(false);

  // Auto-restart after game over
  React.useEffect(() => {
    if (gameOver) {
      setShowGameOverEffect(true);
      if (!muted && !isMuted()) playSound('die');
      const t = setTimeout(() => {
        setBallCol(Math.floor(COLS / 2));
        setRow(0);
        setScore(0);
        setGameOver(false);
        setShowGameOverEffect(false);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [gameOver, muted]);

  useEffect(() => {
    localStorage.setItem('plinko_score', score.toString());
  }, [score]);
  useEffect(() => {
    localStorage.setItem('plinko_balls', JSON.stringify(balls));
  }, [balls]);
  useEffect(() => {
    localStorage.setItem('plinko_state', JSON.stringify(plinkoState));
  }, [plinkoState]);

  const dropBall = () => {
    if (gameOver) return;
    if (!muted && !isMuted()) playSound('spin');
    let col = ballCol;
    for (let r = 0; r < ROWS; r++) {
      col += Math.random() < 0.5 ? -1 : 1;
      col = Math.max(0, Math.min(COLS - 1, col));
      if (!muted && !isMuted()) playSound('button');
    }
    setRow(ROWS);
    setBallCol(col);
    const points = [10, 20, 50, 100, 50, 20, 10][col];
    setScore(points);
    setShowScorePop(true);
    if (!muted && !isMuted()) playSound('win');
    setTimeout(() => setShowScorePop(false), 800);
    setGameOver(true);
  };

  // Submit score to Supabase leaderboard on game over
  React.useEffect(() => {
    if (gameOver && score > 0 && userId) {
      submitScoreSupabase('Plinko', userId, score);
    }
  }, [gameOver, score, userId]);

  // Render pegs in a triangle pattern
  const renderPegs = () => {
    const pegs = [];
    for (let y = 1; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if ((y + x) % 2 === 1) {
          pegs.push(
            <div
              className="plinko-peg"
              style={{ gridColumn: x + 1, gridRow: y + 1 }}
              key={`peg-${x}-${y}`}
            >
              ●
            </div>
          );
        }
      }
    }
    return pegs;
  };

  // Render buckets at the bottom
  const renderBuckets = () => (
    <div style={{ display: 'flex', width: COLS * 20, margin: '0 auto' }}>
      {[10, 20, 50, 100, 50, 20, 10].map((points, i) => (
        <div className="plinko-bucket" style={{ width: 20 }} key={i}>{points}</div>
      ))}
    </div>
  );

  // Animated glowing pegs background
  const pegCount = 18;
  const bgPegs = Array.from({ length: pegCount }, () => ({
    x: Math.random() * COLS * 20,
    y: Math.random() * ROWS * 20,
    r: 3 + Math.random() * 2,
    opacity: 0.10 + Math.random() * 0.18,
  }));

  return (
    <div
      className="arcade-game"
      style={{
        background: 'radial-gradient(ellipse at 60% 40%, #23234a 70%, #18182a 100%)',
        borderRadius: 18,
        boxShadow: '0 0 32px #fd79a8',
        padding: 24,
        maxWidth: 340,
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated glowing pegs background */}
      <svg width={COLS * 20} height={ROWS * 20} style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }}>
        {bgPegs.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y + (Math.sin(Date.now() / 800 + i) * 10)} r={d.r} fill="#fd79a8" opacity={d.opacity} />
        ))}
      </svg>
      <h4 style={{ color: '#fd79a8', textShadow: '0 0 8px #fff', marginBottom: 8, zIndex: 2, position: 'relative' }}>Plinko</h4>
      <div className="arcade-grid plinko-grid" style={{ position: 'relative', zIndex: 2 }}>
        {Array.from({ length: ROWS * COLS }).map((_, i) => {
          const x = i % COLS, y = Math.floor(i / COLS);
          let content = '';
          if (y === row && x === ballCol) content = '⚪';
          return <div className="arcade-cell" key={i}>{content}</div>;
        })}
        {renderPegs()}
      </div>
      {renderBuckets()}
      <button
        onClick={() => {
          if (!muted && !isMuted()) playSound('button');
          dropBall();
        }}
        onTouchStart={() => {
          if (!muted && !isMuted()) playSound('button');
          dropBall();
        }}
        disabled={gameOver}
        style={{
          background: gameOver ? '#888' : 'linear-gradient(135deg,#fd79a8,#fff)',
          color: gameOver ? '#fff' : '#fd79a8',
          borderRadius: 10,
          padding: '8px 28px',
          fontWeight: 700,
          fontSize: 18,
          boxShadow: '0 0 8px #fd79a8',
          border: 'none',
          margin: '12px 0 4px',
          cursor: gameOver ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        Drop Ball
      </button>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: '10px 0 2px', textShadow: '0 0 8px #fd79a8', zIndex: 2, position: 'relative', animation: showScorePop ? 'popSuccess 0.5s' : undefined }}>
        Score: {score}
      </div>
      {gameOver && (
        <div
          style={{
            color: '#fd79a8',
            fontWeight: 900,
            fontSize: 28,
            marginTop: 10,
            textShadow: '0 0 18px #fff, 0 0 24px #fd79a8',
            animation: showGameOverEffect ? 'popError 1.1s' : undefined,
            zIndex: 3,
            position: 'relative',
          }}
        >
          🎯 GAME OVER
        </div>
      )}
      <div style={{ color: '#fd79a8', fontWeight: 600, fontSize: 14, marginTop: 8, textShadow: '0 0 6px #fff' }}>User: {userId || 'Not connected'}</div>
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
  );
};

export default Plinko;
