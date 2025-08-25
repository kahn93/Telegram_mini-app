import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import { submitScoreSupabase } from './leaderboardSupabase';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 480;
const CELL_SIZE = 24;
const GRID_W = Math.floor(GAME_WIDTH / CELL_SIZE);
const GRID_H = Math.floor(GAME_HEIGHT / CELL_SIZE);
const PLAYER_SIZE = 20;
const ENEMY_SIZE = 20;
const ENEMY_COUNT = 3;

function makeGrid() {
  // 0: dirt, 1: tunnel
  const grid = Array.from({ length: GRID_H }, () => Array(GRID_W).fill(0));
  // Carve initial tunnel for player
  for (let y = GRID_H - 2; y < GRID_H; ++y) for (let x = 0; x < GRID_W; ++x) grid[y][x] = 1;
  return grid;
}

function randomTunnelCell(grid: number[][]) {
  let x, y;
  do {
    x = Math.floor(Math.random() * GRID_W);
    y = Math.floor(Math.random() * (GRID_H - 4)) + 2;
  } while (grid[y][x] !== 0);
  return { x, y };
}

const DigDug: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [running, setRunning] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [grid, setGrid] = useState(makeGrid());
  const [player, setPlayer] = useState({ x: Math.floor(GRID_W / 2), y: GRID_H - 2, alive: true });
  const [enemies, setEnemies] = useState(() => {
    const arr = [];
    for (let i = 0; i < ENEMY_COUNT; ++i) {
      arr.push({ ...randomTunnelCell(makeGrid()), alive: true });
    }
    return arr;
  });
  const keys = useRef<{ [k: string]: boolean }>({});

  // Keyboard
  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) setShowInstructions(false);
    };
    const handleUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  // Main game loop
  useEffect(() => {
    if (!running) return;
    let anim: number;
    function loop() {
      update();
      draw();
      if (running) anim = requestAnimationFrame(loop);
    }
    anim = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(anim);
    // eslint-disable-next-line
  }, [running, player, enemies, grid, gameOver, win]);

  function update() {
    if (gameOver || win) return;
    const p = { ...player };
    const g = grid.map(row => [...row]);
    let dx = 0, dy = 0;
    if (keys.current['ArrowLeft']) dx = -1;
    if (keys.current['ArrowRight']) dx = 1;
    if (keys.current['ArrowUp']) dy = -1;
    if (keys.current['ArrowDown']) dy = 1;
    const nx = p.x + dx, ny = p.y + dy;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
      p.x = nx; p.y = ny;
      g[ny][nx] = 1; // Carve tunnel
    }
    setPlayer(p);
    setGrid(g);
    // Pump (attack)
    if (keys.current[' '] && enemies.some(e => e.alive && Math.abs(e.x - p.x) + Math.abs(e.y - p.y) === 1)) {
      setEnemies(enemies => enemies.map(e => {
        if (e.alive && Math.abs(e.x - p.x) + Math.abs(e.y - p.y) === 1) {
          setScore(s => s + 500);
          return { ...e, alive: false };
        }
        return e;
      }));
      keys.current[' '] = false;
    }
    // Enemy movement
    setEnemies(enemies => enemies.map(e => {
      if (!e.alive) return e;
      // Simple AI: move toward player, prefer tunnels
      const options = [
        { x: e.x + 1, y: e.y },
        { x: e.x - 1, y: e.y },
        { x: e.x, y: e.y + 1 },
        { x: e.x, y: e.y - 1 },
      ].filter(pos =>
        pos.x >= 0 && pos.x < GRID_W && pos.y >= 0 && pos.y < GRID_H && g[pos.y][pos.x] === 1
      );
      if (options.length > 0) {
        // Move toward player
        options.sort((a, b) => Math.abs(a.x - p.x) + Math.abs(a.y - p.y) - (Math.abs(b.x - p.x) + Math.abs(b.y - p.y)));
        return { ...e, x: options[0].x, y: options[0].y };
      }
      return e;
    }));
    // Enemy collision
    for (const e of enemies) {
      if (e.alive && e.x === p.x && e.y === p.y) {
        setPlayer(pl => ({ ...pl, alive: false }));
        setGameOver(true);
        setRunning(false);
        return;
      }
    }
    // Win
    if (enemies.every(e => !e.alive)) {
      setWin(true);
      setRunning(false);
      setScore(s => s + 1000);
    }
  }

  function draw() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Dirt
    for (let y = 0; y < GRID_H; ++y) {
      for (let x = 0; x < GRID_W; ++x) {
        ctx.fillStyle = grid[y][x] === 0 ? '#a0522d' : '#222';
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
    // Player
    if (player.alive) {
      ctx.save();
      ctx.translate(player.x * CELL_SIZE + CELL_SIZE / 2, player.y * CELL_SIZE + CELL_SIZE / 2);
      ctx.fillStyle = '#0ff';
      ctx.beginPath();
      ctx.arc(0, 0, PLAYER_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('👷', -12, 8);
      ctx.restore();
    }
    // Enemies
    for (const e of enemies) {
      if (!e.alive) continue;
      ctx.save();
      ctx.translate(e.x * CELL_SIZE + CELL_SIZE / 2, e.y * CELL_SIZE + CELL_SIZE / 2);
      ctx.fillStyle = '#f00';
      ctx.beginPath();
      ctx.arc(0, 0, ENEMY_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('👾', -10, 7);
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
      ctx.fillText('Dig Dug (Mini)', 120, 150);
      ctx.font = '14px sans-serif';
      ctx.fillText('Arrow keys: Move', 80, 180);
      ctx.fillText('Space: Pump enemy', 80, 200);
      ctx.fillText('Defeat all enemies!', 80, 220);
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
  }

  function restart() {
    setPlayer({ x: Math.floor(GRID_W / 2), y: GRID_H - 2, alive: true });
    setGrid(makeGrid());
    setEnemies(() => {
      const arr = [];
      for (let i = 0; i < ENEMY_COUNT; ++i) {
        arr.push({ ...randomTunnelCell(makeGrid()), alive: true });
      }
      return arr;
    });
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
      await submitScoreSupabase('dig_dug', userId, score);
    } catch {
      // Error intentionally ignored
    }
    setSubmitting(false);
  }

  return (
    <div className="arcade-game-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Dig Dug</h2>
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        style={{ border: '2px solid #fff', background: '#222', marginBottom: 16, maxWidth: '100%', height: 'auto' }}
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
        <LeaderboardMini gameId="dig_dug" />
      </div>
    </div>
  );
};

export default DigDug;
