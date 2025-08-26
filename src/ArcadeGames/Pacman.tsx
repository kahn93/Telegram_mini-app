import * as React from 'react';
import { useEffect, useState } from 'react';
import './GameStyles.css';
import { submitScoreSupabase } from './leaderboardSupabase';
import { playSound, isMuted } from '../soundManager';

// Lightweight Pacman implementation (simplified for mini-game)
const GRID_SIZE = 10;
const INITIAL_PACMAN = { x: 1, y: 1, dir: 'right' };
const INITIAL_GHOST = { x: 8, y: 8 };
const DOTS = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);

function getIndex(x: number, y: number) {
  return y * GRID_SIZE + x;
}

interface TelegramWebApp {
  initDataUnsafe?: {
    user?: {
      id?: string | number;
    };
  };
}

const Pacman: React.FC<{ userid?: string; muted?: boolean }> = ({ userid: propUserId = '', muted = false }) => {
  // Telegram userId auto-detect
  const [userId, setUserId] = useState<string>(propUserId);
  useEffect(() => {
    if (!propUserId) {
      try {
        const tg = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
        if (tg && tg.initDataUnsafe?.user?.id) {
          setUserId(tg.initDataUnsafe.user.id.toString());
        }
      } catch (e) {
        // Ignore Telegram detection errors
      }
    }
  }, [propUserId]);

  const [pacman, setPacman] = useState(INITIAL_PACMAN);
  const [ghost, setGhost] = useState(INITIAL_GHOST);
  const [dots, setDots] = useState(DOTS);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOverEffect, setShowGameOverEffect] = useState(false);
  const [showScorePop, setShowScorePop] = useState(false);

  // Auto-restart after game over
  useEffect(() => {
    if (gameOver) {
      setShowGameOverEffect(true);
      if (!muted && !isMuted()) playSound('die');
      const t = setTimeout(() => {
        setPacman(INITIAL_PACMAN);
        setGhost(INITIAL_GHOST);
        setDots(DOTS);
        setScore(0);
        setGameOver(false);
        setShowGameOverEffect(false);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [gameOver, muted]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      setPacman((p) => {
        let { x, y, dir } = p;
        if (e.key === 'ArrowUp') y = Math.max(0, y - 1), dir = 'up';
        if (e.key === 'ArrowDown') y = Math.min(GRID_SIZE - 1, y + 1), dir = 'down';
        if (e.key === 'ArrowLeft') x = Math.max(0, x - 1), dir = 'left';
        if (e.key === 'ArrowRight') x = Math.min(GRID_SIZE - 1, x + 1), dir = 'right';
        if (!muted && !isMuted()) playSound('button');
        return { x, y, dir };
      });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver, muted]);

  useEffect(() => {
    if (gameOver) return;
    // Ghost moves randomly
    const interval = setInterval(() => {
      setGhost((g) => {
        const moves = [
          { x: g.x + 1, y: g.y },
          { x: g.x - 1, y: g.y },
          { x: g.x, y: g.y + 1 },
          { x: g.x, y: g.y - 1 },
        ].filter(({ x, y }) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE);
        return moves[Math.floor(Math.random() * moves.length)] || g;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [gameOver]);

  useEffect(() => {
    // Eat dot
    const idx = getIndex(pacman.x, pacman.y);
    if (dots.includes(idx)) {
      setDots((d) => d.filter((i) => i !== idx));
      setScore((s) => s + 10);
      setShowScorePop(true);
      if (!muted && !isMuted()) playSound('win');
      setTimeout(() => setShowScorePop(false), 400);
    }
    // Check collision
    if (pacman.x === ghost.x && pacman.y === ghost.y) {
      setFinalScore(score);
      setGameOver(true);
    }
    // Win
    if (dots.length === 0) {
      setFinalScore(score);
      setGameOver(true);
      if (!muted && !isMuted()) playSound('bonus');
    }
  }, [pacman, ghost, dots, score, muted]);

  // Submit score to Supabase leaderboard on game over
  useEffect(() => {
    if (gameOver && finalScore > 0 && userId) {
      submitScoreSupabase('Pacman', userId, finalScore);
    }
  }, [gameOver, finalScore, userId]);

  // Animated floating dots background
  const dotCount = 22;
  const bgDots = Array.from({ length: dotCount }, () => ({
    x: Math.random() * 200,
    y: Math.random() * 200,
    r: 2 + Math.random() * 2,
    opacity: 0.10 + Math.random() * 0.18,
  }));

  return (
    <div
      className="arcade-game"
      style={{
        background: 'radial-gradient(ellipse at 60% 40%, #23234a 70%, #18182a 100%)',
        borderRadius: 18,
        boxShadow: '0 0 32px #ffe600',
        padding: 24,
        maxWidth: 340,
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated floating dots background */}
      <svg width={200} height={200} style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }}>
        {bgDots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y + (Math.sin(Date.now() / 800 + i) * 10)} r={d.r} fill="#ffe600" opacity={d.opacity} />
        ))}
      </svg>
      <h4 style={{ color: '#ffe600', textShadow: '0 0 8px #fff', marginBottom: 8, zIndex: 2, position: 'relative' }}>Pacman</h4>
      <div className="arcade-grid" style={{ zIndex: 2, position: 'relative' }}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE, y = Math.floor(i / GRID_SIZE);
          let content = '';
          if (pacman.x === x && pacman.y === y) content = '😋';
          else if (ghost.x === x && ghost.y === y) content = '👻';
          else if (dots.includes(i)) content = '•';
          return <div className="arcade-cell" key={i}>{content}</div>;
        })}
      </div>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: '10px 0 2px', textShadow: '0 0 8px #ffe600', zIndex: 2, position: 'relative', animation: showScorePop ? 'popSuccess 0.5s' : undefined }}>
        Score: {score}
      </div>
      {gameOver && (
        <div
          style={{
            color: '#ffe600',
            fontWeight: 900,
            fontSize: 28,
            marginTop: 10,
            textShadow: '0 0 18px #fff, 0 0 24px #ffe600',
            animation: showGameOverEffect ? 'popError 1.1s' : undefined,
            zIndex: 3,
            position: 'relative',
          }}
        >
          {dots.length === 0 ? '🏆 YOU WIN!' : '💀 GAME OVER'}
        </div>
      )}
      <div style={{ color: '#ffe600', fontWeight: 600, fontSize: 14, marginTop: 8, textShadow: '0 0 6px #fff' }}>User: {userId || 'Not connected'}</div>
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

export default Pacman;
