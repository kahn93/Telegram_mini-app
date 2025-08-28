import * as React from 'react';
import { useEffect, useState } from 'react';
import './GameStyles.css';
import { submitScoreSupabase } from './leaderboardSupabase';
import { playSound, isMuted } from '../soundManager';

// Lightweight Tetris mini-game
const ROWS = 16, COLS = 10;
const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]], // Z
  [[1, 0, 0], [1, 1, 1]], // J
  [[0, 0, 1], [1, 1, 1]], // L
];

function randomShape() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { shape, x: 3, y: 0 };
}

interface TelegramWebApp {
  initDataUnsafe?: {
    user?: {
      id?: string | number;
    };
  };
}

const Tetris: React.FC<{ userid?: string; muted?: boolean }> = ({ userid: propUserId = '', muted = false }) => {
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

  const [board, setBoard] = useState(() => {
    const stored = localStorage.getItem('tetris_board');
    return stored ? JSON.parse(stored) : Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  });
  const [current, setCurrent] = useState(() => {
    const stored = localStorage.getItem('tetris_current');
    return stored ? JSON.parse(stored) : randomShape();
  });
  const [score, setScore] = useState(() => {
    const stored = localStorage.getItem('tetris_score');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(() => {
    const stored = localStorage.getItem('tetris_gameOver');
    return stored ? JSON.parse(stored) : false;
  });
  // Auto-save logic
  useEffect(() => {
    localStorage.setItem('tetris_board', JSON.stringify(board));
  }, [board]);
  useEffect(() => {
    localStorage.setItem('tetris_current', JSON.stringify(current));
  }, [current]);
  useEffect(() => {
    localStorage.setItem('tetris_score', score.toString());
  }, [score]);
  useEffect(() => {
    localStorage.setItem('tetris_gameOver', JSON.stringify(gameOver));
  }, [gameOver]);
  const [showGameOverEffect, setShowGameOverEffect] = useState(false);
  const [showScorePop, setShowScorePop] = useState(false);

  // Auto-restart after game over
  useEffect(() => {
    if (gameOver) {
      setShowGameOverEffect(true);
      if (!muted && !isMuted()) playSound('die');
      const t = setTimeout(() => {
        setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
        setCurrent(randomShape());
        setScore(0);
        setGameOver(false);
        setShowGameOverEffect(false);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [gameOver, muted]);

  const merge = (b: number[][], c: { shape: number[][]; x: number; y: number }) => {
    const newB = b.map((row) => [...row]);
    c.shape.forEach((row: number[], dy: number) =>
      row.forEach((cell, dx) => {
        if (cell) {
          const x = c.x + dx, y = c.y + dy;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) newB[y][x] = 1;
        }
      })
    );
    return newB;
  };

  const canMove = React.useCallback((dx: number, dy: number, shape = current.shape) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const nx = current.x + dx + x, ny = current.y + dy + y;
          if (nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && board[ny][nx])) return false;
        }
      }
    }
    return true;
  }, [current, board]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      if (canMove(0, 1)) {
        setCurrent((c: { y: number; }) => ({ ...c, y: c.y + 1 }));
        if (!muted && !isMuted()) playSound('button');
      } else {
        setBoard((b: number[][]) => merge(b, current));
        // Clear lines
        setBoard((b: any[]) => {
          const newB = b.filter((row: any[]) => row.some((cell: any) => !cell));
          const lines = ROWS - newB.length;
          if (lines > 0) {
            setScore((s) => s + lines * 100);
            setShowScorePop(true);
            if (!muted && !isMuted()) playSound('win');
            setTimeout(() => setShowScorePop(false), 800);
          }
          return [
            ...Array.from({ length: lines }, () => Array(COLS).fill(0)),
            ...newB,
          ];
        });
        setCurrent(randomShape());
        if (!canMove(0, 0)) setGameOver(true);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [current, board, gameOver, canMove, muted]);

  // Submit score to Supabase leaderboard on game over
  useEffect(() => {
    if (gameOver && score > 0 && userId) {
      submitScoreSupabase('Tetris', userId, score);
    }
  }, [gameOver, score, userId]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft' && canMove(-1, 0)) {
        setCurrent((c: { x: number; }) => ({ ...c, x: c.x - 1 }));
        if (!muted && !isMuted()) playSound('button');
      }
      if (e.key === 'ArrowRight' && canMove(1, 0)) {
        setCurrent((c: { x: number; }) => ({ ...c, x: c.x + 1 }));
        if (!muted && !isMuted()) playSound('button');
      }
      if (e.key === 'ArrowDown' && canMove(0, 1)) {
        setCurrent((c: { y: number; }) => ({ ...c, y: c.y + 1 }));
        if (!muted && !isMuted()) playSound('button');
      }
      if (e.key === 'ArrowUp') {
        // Rotate
        const rotated = current.shape[0].map((_: any, i: string | number) => current.shape.map((row: number[]) => row[i]).reverse());
        if (canMove(0, 0, rotated)) {
          setCurrent((c: any) => ({ ...c, shape: rotated }));
          if (!muted && !isMuted()) playSound('bonus');
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, board, gameOver, canMove, muted]);

  // Render board with current piece overlaid
  const renderBoard = () => {
    // Copy board
    const display = board.map((row: any) => [...row]);
    // Overlay current piece
    current.shape.forEach((r: number[], dy: number) =>
      r.forEach((v, dx) => {
        if (v) {
          const x = current.x + dx, y = current.y + dy;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) display[y][x] = 2;
        }
      })
    );
    return display.map((row: any[], y: string) =>
      row.map((cell: number, x: string) => (
        <div
          className={cell === 2 ? 'arcade-cell tetris-active' : cell ? 'arcade-cell tetris-filled' : 'arcade-cell'}
          key={x + '-' + y}
        />
      ))
    );
  };

  // Animated falling block background
  const blockCount = 18;
  const blocks = Array.from({ length: blockCount }, () => ({
    x: Math.random() * COLS,
    y: Math.random() * ROWS,
    color: `hsl(${Math.random() * 360}, 80%, 60%)`,
    size: 0.7 + Math.random() * 0.7,
    opacity: 0.13 + Math.random() * 0.18,
  }));

  return (
    <div
      className="arcade-game"
      style={{
        background: 'radial-gradient(ellipse at 60% 40%, #23234a 70%, #18182a 100%)',
        borderRadius: 18,
        boxShadow: '0 0 32px #00fff7',
        padding: 24,
        maxWidth: 340,
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated falling blocks background */}
      <svg width={COLS * 20} height={ROWS * 20} style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }}>
        {blocks.map((b, i) => (
          <rect key={i} x={b.x * 20} y={b.y * 20 + (Math.sin(Date.now() / 800 + i) * 10)} width={b.size * 18} height={b.size * 18} fill={b.color} opacity={b.opacity} rx={4} />
        ))}
      </svg>
      <h4 style={{ color: '#00fff7', textShadow: '0 0 8px #fff', marginBottom: 8, zIndex: 2, position: 'relative' }}>Tetris</h4>
      <div className="arcade-grid tetris-grid" style={{ zIndex: 2, position: 'relative' }}>
        {renderBoard()}
      </div>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: '10px 0 2px', textShadow: '0 0 8px #00fff7', zIndex: 2, position: 'relative', animation: showScorePop ? 'popSuccess 0.5s' : undefined }}>
        Score: {score}
      </div>
      {gameOver && (
        <div
          style={{
            color: '#00fff7',
            fontWeight: 900,
            fontSize: 28,
            marginTop: 10,
            textShadow: '0 0 18px #fff, 0 0 24px #00fff7',
            animation: showGameOverEffect ? 'popError 1.1s' : undefined,
            zIndex: 3,
            position: 'relative',
          }}
        >
          🧱 GAME OVER
        </div>
      )}
  {/* Removed unused userId display for consistency */}
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

export default Tetris;
