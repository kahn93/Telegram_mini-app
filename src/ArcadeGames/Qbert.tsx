import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import { submitScoreSupabase } from './leaderboardSupabase';

// Q*bert game constants
const TILE_SIZE = 40;
const PYRAMID_HEIGHT = 7;
const PLAYER_RADIUS = 16;
const ENEMY_RADIUS = 14;
const JUMP_DURATION = 180; // ms
const ENEMY_INTERVAL = 2000; // ms
const COLORS = ['#f7c873', '#f7e273', '#f7a673', '#f77373', '#73f7b2'];

function getPyramidTiles() {
  const tiles = [];
  for (let row = 0; row < PYRAMID_HEIGHT; row++) {
    for (let col = 0; col <= row; col++) {
      tiles.push({ row, col, color: 0 });
    }
  }
  return tiles;
}

function getTileCenter(row: number, col: number) {
  const x = 220 + (col - row / 2) * TILE_SIZE;
  const y = 60 + row * TILE_SIZE * 0.85;
  return { x, y };
}

function isOnPyramid(row: number, col: number) {
  return row >= 0 && row < PYRAMID_HEIGHT && col >= 0 && col <= row;
}

function randomEnemyStart() {
  // Enemies start at the top or random edge
  if (Math.random() < 0.5) return { row: 0, col: 0 };
  const edgeRow = Math.floor(Math.random() * (PYRAMID_HEIGHT - 1)) + 1;
  return { row: edgeRow, col: Math.random() < 0.5 ? 0 : edgeRow };
}

const ENEMY_TYPES = [
  { color: '#e74c3c', points: 150 }, // Red ball
  { color: '#2ecc40', points: 200 }, // Green ball
];

const Qbert: React.FC<{ userId: string }> = ({ userId }) => {
  // State declarations should come first
  const [tiles, setTiles] = useState(getPyramidTiles());
  const [player, setPlayer] = useState({ row: 0, col: 0, jumping: false });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  type Enemy = { row: number; col: number; type: { color: string; points: number } };
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [win, setWin] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the game
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 480, 400);
    // Draw pyramid
    tiles.forEach(tile => {
      const { x, y } = getTileCenter(tile.row, tile.col);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE * 0.85);
      ctx.lineTo(x, y + TILE_SIZE * 1.7);
      ctx.lineTo(x - TILE_SIZE / 2, y + TILE_SIZE * 0.85);
      ctx.closePath();
      ctx.fillStyle = COLORS[tile.color];
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
      ctx.restore();
    });
    // Draw player
    const { x, y } = getTileCenter(player.row, player.col);
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y + TILE_SIZE * 0.7, PLAYER_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffb347';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.stroke();
    ctx.restore();
    // Draw player face
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y + TILE_SIZE * 0.7, 6, 0, Math.PI, false);
    ctx.strokeStyle = '#333';
    ctx.stroke();
    ctx.restore();
    // Draw enemies
    enemies.forEach(enemy => {
      const { x: ex, y: ey } = getTileCenter(enemy.row, enemy.col);
      ctx.save();
      ctx.beginPath();
      ctx.arc(ex, ey + TILE_SIZE * 0.7, ENEMY_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = enemy.type.color;
      ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.stroke();
      ctx.restore();
    });
    // Draw score
    ctx.save();
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.restore();
    if (gameOver) {
      ctx.save();
      ctx.font = '32px Arial';
      ctx.fillStyle = '#f00';
      ctx.fillText('Game Over!', 140, 200);
      ctx.font = '20px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText('Press R to restart', 150, 240);
      ctx.restore();
    }
    if (win) {
      ctx.save();
      ctx.font = '32px Arial';
      ctx.fillStyle = '#0f0';
      ctx.fillText('You Win!', 160, 200);
      ctx.font = '20px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText('Press R to restart', 150, 240);
      ctx.restore();
    }
  }, [tiles, player, enemies, score, gameOver, win]);

  // Handle keyboard
  // Define a type for the player state
  type Player = { row: number; col: number; jumping: boolean };

  useEffect(() => {
    if (gameOver || win) return;
    const handleKey = (e: KeyboardEvent) => {
      if ((player as Player).jumping) return;
      let dRow = 0, dCol = 0;
      if (e.key === 'ArrowUp' || e.key === 'w') { dRow = -1; }
      else if (e.key === 'ArrowDown' || e.key === 's') { dRow = 1; }
      else if (e.key === 'ArrowLeft' || e.key === 'a') { dCol = -1; }
      else if (e.key === 'ArrowRight' || e.key === 'd') { dCol = 1; }
      else if (e.key === 'r' || e.key === 'R') { restart(); return; }
      if (dRow !== 0 || dCol !== 0) {
        const newRow = (player as Player).row + dRow;
        const newCol = (player as Player).col + dCol;
        if (isOnPyramid(newRow, newCol)) {
          setPlayer(p => ({ ...p, jumping: true }));
          setPlayer(p => ({ ...p, jumping: true }));
          setTimeout(() => {
            setPlayer({ row: newRow, col: newCol, jumping: false });
            setTiles(ts => ts.map(tile =>
              tile.row === newRow && tile.col === newCol && tile.color < COLORS.length - 1
                ? { ...tile, color: tile.color + 1 }
                : tile
            ));
            setScore(s => s + 25);
          }, JUMP_DURATION);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [player, gameOver, win]);

  // Enemy logic
  useEffect(() => {
    if (gameOver || win) return;
    const interval = setInterval(() => {
      setEnemies(enemies => {
        // Move enemies
        const moved = enemies
          .map(enemy => {
            // Move down pyramid
            const dRow = Math.random() < 0.5 ? 1 : 0;
            const dCol = dRow === 1 ? (Math.random() < 0.5 ? 0 : 1) : (Math.random() < 0.5 ? -1 : 1);
            const newRow = enemy.row + dRow;
            const newCol = enemy.col + dCol;
            if (!isOnPyramid(newRow, newCol)) {
              // Remove if off pyramid
              return null;
            }
            return { ...enemy, row: newRow, col: newCol };
          })
          .filter((e): e is Enemy => e !== null);
        // Add new enemy
        if (Math.random() < 0.7) {
          const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
          moved.push({ ...randomEnemyStart(), type });
        }
        return moved;
      });
    }, ENEMY_INTERVAL);
    return () => clearInterval(interval);
  }, [gameOver, win]);

  // Collision detection
  useEffect(() => {
    if (gameOver || win) return;
    enemies.forEach(enemy => {
      if (enemy.row === player.row && enemy.col === player.col) {
        setGameOver(true);
        submitScoreSupabase('Qbert', userId, score);
      }
    });
  }, [enemies, player, gameOver, win, score, userId]);

  // Win condition
  useEffect(() => {
    if (tiles.every(tile => tile.color === COLORS.length - 1)) {
      setWin(true);
      submitScoreSupabase('Qbert', userId, score + 500);
      setScore(s => s + 500);
    }
  }, [tiles, userId, score]);

  // Restart
  function restart() {
    setTiles(getPyramidTiles());
    setPlayer({ row: 0, col: 0, jumping: false });
    setScore(0);
    setGameOver(false);
    setEnemies([]);
    setWin(false);
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Q*bert</h2>
      <canvas ref={canvasRef} width={480} height={400} style={{ background: '#222', border: '3px solid #f7c873', marginBottom: 10 }} />
      <div style={{ color: '#fff', marginBottom: 8 }}>
        Use arrow keys or WASD to jump. Change all tiles' color. Avoid enemies!
      </div>
  <LeaderboardMini game="Qbert" />
      <button onClick={restart} style={{ margin: 8 }}>Restart</button>
    </div>
  );
};

export default Qbert;
