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

const SnakeGame: React.FC = () => {
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
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) setShowInstructions(false);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [dir]);

  // Main game loop
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
          return prev;
        }
        const newSnake = [head, ...prev];
        // Food
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 100);
          setFood(randomFood(newSnake));
        } else {
          newSnake.pop();
        }
        // Win
        if (newSnake.length === GRID_WIDTH * GRID_HEIGHT) {
          setWin(true);
          setRunning(false);
        }
        return newSnake;
      });
    }, SPEED);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [running, nextDir, food, gameOver, win]);

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
    ctx.fillText(`Score: ${score}`, 10, 20);
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
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(60, 180, 280, 80);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('Game Over', 120, 220);
    }
    if (win) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(60, 180, 280, 80);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('You Win!', 140, 220);
    }
  }, [snake, food, score, showInstructions, gameOver, win]);

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
  }

  async function handleSubmitScore() {
    setSubmitting(true);
    try {
      const userId = localStorage.getItem('userId') || 'anon';
      await submitScoreSupabase('snake', userId, score);
    } catch {
      // Error intentionally ignored
    }
    setSubmitting(false);
  }

  return (
    <div className="arcade-game-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Snake</h2>
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        style={{ border: '2px solid #fff', background: '#111', marginBottom: 16, maxWidth: '100%', height: 'auto' }}
        tabIndex={0}
      />
      {(gameOver || win) && (
        <div style={{ margin: 8 }}>
          <button onClick={restart} style={{ marginRight: 12 }}>Restart</button>
          <button onClick={handleSubmitScore} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Score'}
          </button>
        </div>
      )}
      <div style={{ marginTop: 24, width: '100%' }}>
        <LeaderboardMini gameId="snake" />
      </div>
    </div>
  );
};

export default SnakeGame;
