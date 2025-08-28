import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import { submitScoreSupabase } from './leaderboardSupabase';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 480;
const CELL_SIZE = 20;
const GRID_WIDTH = GAME_WIDTH / CELL_SIZE;
const GRID_HEIGHT = GAME_HEIGHT / CELL_SIZE;
const INIT_SNAKE = [
  { x: 10, y: 12 },
  { x: 9, y: 12 },
  { x: 8, y: 12 },
];
const INIT_DIR = { x: 1, y: 0 };
const SPEED = 90; // ms per move

function randomFood(snake: { x: number; y: number }[]): { x: number; y: number } {
  let pos: { x: number; y: number };
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT),
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

import { playSound, isMuted } from '../soundManager';

interface SnakeProps {
  userid?: string;
  muted?: boolean;
}
const SnakeGame: React.FC<SnakeProps> = ({ userid: propUserId, muted }) => {
  const [userId, setUserId] = useState<string>(propUserId || '');
  useEffect(() => {
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(INIT_SNAKE);
  const [dir, setDir] = useState(INIT_DIR);
  const [nextDir, setNextDir] = useState(INIT_DIR);
  const [food, setFood] = useState(randomFood(INIT_SNAKE));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [running, setRunning] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Keyboard
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && dir.y !== 1) setNextDir({ x: 0, y: -1 });
      else if (e.key === 'ArrowDown' && dir.y !== -1) setNextDir({ x: 0, y: 1 });
      else if (e.key === 'ArrowLeft' && dir.x !== 1) setNextDir({ x: -1, y: 0 });
      else if (e.key === 'ArrowRight' && dir.x !== -1) setNextDir({ x: 1, y: 0 });
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setShowInstructions(false);
        if (!muted && !isMuted()) playSound('button');
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [dir, muted]);

  // Main game loop
  const [showGameOverEffect, setShowGameOverEffect] = useState(false);
  const [showScorePop, setShowScorePop] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (gameOver || win) return;
    const interval = setInterval(() => {
      setDir(nextDir);
      setSnake(prev => {
        const head = { x: prev[0].x + nextDir.x, y: prev[0].y + nextDir.y };
        // Wall collision
        if (
          head.x < 0 ||
          head.x >= GRID_WIDTH ||
          head.y < 0 ||
          head.y >= GRID_HEIGHT ||
          prev.some(s => s.x === head.x && s.y === head.y)
        ) {
          setGameOver(true);
          setRunning(false);
          setShowGameOverEffect(true);
          if (!muted && !isMuted()) playSound('die');
          setTimeout(() => setShowGameOverEffect(false), 1200);
          return prev;
        }
        const newSnake = [head, ...prev];
        // Food
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 100);
          setFood(randomFood(newSnake));
          if (!muted && !isMuted()) playSound('win');
          setShowScorePop(true);
          setTimeout(() => setShowScorePop(false), 500);
        } else {
          newSnake.pop();
        }
        // Win
        if (newSnake.length === GRID_WIDTH * GRID_HEIGHT) {
          setWin(true);
          setRunning(false);
          setShowGameOverEffect(true);
          if (!muted && !isMuted()) playSound('bonus');
          setTimeout(() => setShowGameOverEffect(false), 1200);
        }
        return newSnake;
      });
    }, SPEED);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [running, nextDir, food, gameOver, win, muted]);

  // Draw
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Food
    ctx.save();
    ctx.translate(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2);
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.arc(0, 0, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('🍎', -10, 8);
    ctx.restore();
    // Snake
    for (let i = 0; i < snake.length; ++i) {
      const s = snake[i];
      ctx.save();
      ctx.translate(s.x * CELL_SIZE + CELL_SIZE / 2, s.y * CELL_SIZE + CELL_SIZE / 2);
      ctx.fillStyle = i === 0 ? '#0f0' : '#0ff';
      ctx.beginPath();
      ctx.arc(0, 0, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(i === 0 ? '🐍' : '●', -8, 7);
      ctx.restore();
    }
    // Score
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.save();
  if (showScorePop) ctx.shadowColor = '#ffe259', ctx.shadowBlur = 16;
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.restore();
    if (showInstructions) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(30, 120, 340, 120);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Snake (Mini)', 140, 150);
      ctx.font = '14px sans-serif';
      ctx.fillText('Arrow keys: Move', 80, 180);
      ctx.fillText('Eat apples, avoid yourself!', 80, 200);
      ctx.fillText('Press any key to start', 100, 240);
    }
    if (gameOver) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#18182a';
      ctx.fillRect(60, 180, 280, 80);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fd79a8';
      ctx.font = 'bold 28px sans-serif';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = showGameOverEffect ? 24 : 0;
      ctx.fillText('Game Over', 120, 220);
      ctx.restore();
    }
    if (win) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#18182a';
      ctx.fillRect(60, 180, 280, 80);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffe259';
      ctx.font = 'bold 28px sans-serif';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = showGameOverEffect ? 24 : 0;
      ctx.fillText('You Win!', 140, 220);
      ctx.restore();
    }
  }, [snake, food, score, showInstructions, gameOver, win, showGameOverEffect, showScorePop]);

  function restart() {
    setSnake(INIT_SNAKE);
    setDir(INIT_DIR);
    setNextDir(INIT_DIR);
    setFood(randomFood(INIT_SNAKE));
    setScore(0);
    setGameOver(false);
    setWin(false);
    setRunning(true);
    setShowInstructions(true);
    setShowGameOverEffect(false);
    if (!muted && !isMuted()) playSound('button');
  }

  async function handleSubmitScore() {
    setSubmitting(true);
    try {
      const id = userId || localStorage.getItem('userId') || 'anon';
      await submitScoreSupabase('snake', id, score);
    } catch {
      // Error intentionally ignored
    }
    setSubmitting(false);
  }

  // Animated glowing background
  const bgDots = Array.from({ length: 18 }, () => ({
    x: Math.random() * GAME_WIDTH,
    y: Math.random() * GAME_HEIGHT,
    r: 3 + Math.random() * 2,
    opacity: 0.10 + Math.random() * 0.18,
  }));

  return (
    <div
      className="arcade-game-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'radial-gradient(ellipse at 60% 40%, #23234a 70%, #18182a 100%)',
        borderRadius: 18,
        boxShadow: '0 0 32px #fd79a8',
        padding: 24,
        maxWidth: 440,
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated glowing dots background */}
      <svg width={GAME_WIDTH} height={GAME_HEIGHT} style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }}>
        {bgDots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y + (Math.sin(Date.now() / 800 + i) * 10)} r={d.r} fill="#fd79a8" opacity={d.opacity} />
        ))}
      </svg>
      <h2 style={{ color: '#fd79a8', textShadow: '0 0 8px #fff', marginBottom: 8, zIndex: 2, position: 'relative' }}>Snake</h2>
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        style={{ border: '2px solid #fff', background: 'transparent', marginBottom: 16, maxWidth: '100%', height: 'auto', zIndex: 2, position: 'relative' }}
        tabIndex={0}
      />
      {(gameOver || win) && (
        <div style={{ margin: 8 }}>
          <button
            onClick={restart}
            onTouchStart={restart}
            style={{
              marginRight: 12,
              background: '#fd79a8',
              color: '#fff',
              borderRadius: 10,
              padding: '8px 28px',
              fontWeight: 700,
              fontSize: 18,
              boxShadow: '0 0 8px #fd79a8',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
          >Restart</button>
          <button
            onClick={handleSubmitScore}
            onTouchStart={handleSubmitScore}
            disabled={submitting}
            style={{
              background: '#ffe259',
              color: '#23234a',
              borderRadius: 10,
              padding: '8px 28px',
              fontWeight: 700,
              fontSize: 18,
              boxShadow: '0 0 8px #ffe259',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
          >{submitting ? 'Submitting...' : 'Submit Score'}</button>
        </div>
      )}
      <div style={{ color: '#fd79a8', fontWeight: 600, fontSize: 14, marginTop: 8, textShadow: '0 0 6px #fff' }}>User: {userId || 'Not connected'}</div>
      <div style={{ marginTop: 24, width: '100%' }}>
        <LeaderboardMini gameId="snake" />
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
  );
};

export default SnakeGame;
