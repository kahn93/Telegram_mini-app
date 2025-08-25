import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import { submitScoreSupabase } from './leaderboardSupabase';

// Rampage game constants
const GAME_WIDTH = 480;
const GAME_HEIGHT = 400;
const PLAYER_SIZE = 32;
const BUILDING_WIDTH = 48;
const BUILDING_HEIGHT = 120;
const BUILDING_ROWS = 3;
const BUILDING_COLS = 4;
const ENEMY_SIZE = 24;
const ENEMY_SPEED = 1.2;
const PLAYER_SPEED = 3.2;
const PUNCH_RANGE = 36;
const PUNCH_COOLDOWN = 400;
const MAX_HEALTH = 100;

function getBuildings() {
  // Each building is a grid of blocks (3x4)
  const buildings = [];
  for (let c = 0; c < BUILDING_COLS; c++) {
    for (let r = 0; r < BUILDING_ROWS; r++) {
      buildings.push({
        x: 40 + c * (BUILDING_WIDTH + 18),
        y: 220 + r * (BUILDING_HEIGHT / BUILDING_ROWS),
        w: BUILDING_WIDTH,
        h: BUILDING_HEIGHT / BUILDING_ROWS,
        destroyed: false,
        col: c,
        row: r,
      });
    }
  }
  return buildings;
}

function randomEnemy() {
  // Enemies spawn at random top positions
  return {
    x: Math.random() * (GAME_WIDTH - ENEMY_SIZE),
    y: 0,
    vx: (Math.random() - 0.5) * ENEMY_SPEED * 2,
    vy: ENEMY_SPEED + Math.random() * 0.7,
    alive: true,
  };
}

const Rampage: React.FC<{ userId: string }> = ({ userId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState({ x: 80, y: 320, health: MAX_HEALTH, punching: false, punchDir: 1 });
  const [buildings, setBuildings] = useState(getBuildings());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [enemies, setEnemies] = useState([randomEnemy()]);
  const [lastPunch, setLastPunch] = useState(0);

  // Draw
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Draw sky
    ctx.fillStyle = '#7ec0ee';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Draw buildings
    buildings.forEach(b => {
      ctx.save();
      ctx.globalAlpha = b.destroyed ? 0.2 : 1;
      ctx.fillStyle = b.destroyed ? '#bbb' : '#444';
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = '#222';
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.restore();
    });
    // Draw player (monster)
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = '#b5651d';
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_SIZE / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('🦍', -18, 14);
    ctx.restore();
    // Draw punch
    if (player.punching) {
      ctx.save();
      ctx.strokeStyle = '#f00';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(player.x + player.punchDir * PUNCH_RANGE, player.y);
      ctx.stroke();
      ctx.restore();
    }
    // Draw enemies (helicopters)
    enemies.forEach(e => {
      if (!e.alive) return;
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(0, 0, ENEMY_SIZE / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('🚁', -14, 10);
      ctx.restore();
    });
    // Draw health
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.fillRect(10, 10, 104, 18);
    ctx.fillStyle = '#f00';
    ctx.fillRect(12, 12, player.health, 14);
    ctx.strokeStyle = '#222';
    ctx.strokeRect(10, 10, 104, 18);
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#222';
    ctx.fillText('Health', 40, 24);
    ctx.restore();
    // Draw score
    ctx.save();
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Score: ${score}`, 340, 28);
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
  }, [player, buildings, enemies, score, gameOver, win]);

  // Keyboard
  useEffect(() => {
    if (gameOver || win) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') { restart(); return; }
      if (player.punching) return;
      let dx = 0;
      if (e.key === 'ArrowLeft' || e.key === 'a') dx = -PLAYER_SPEED;
      else if (e.key === 'ArrowRight' || e.key === 'd') dx = PLAYER_SPEED;
      if (dx !== 0) {
        setPlayer(p => ({ ...p, x: Math.max(PLAYER_SIZE / 2, Math.min(GAME_WIDTH - PLAYER_SIZE / 2, p.x + dx)), punchDir: dx > 0 ? 1 : -1 }));
      }
      if (e.key === ' ' || e.key === 'z') {
        if (Date.now() - lastPunch > PUNCH_COOLDOWN) {
          setPlayer(p => ({ ...p, punching: true }));
          setLastPunch(Date.now());
          setTimeout(() => setPlayer(p => ({ ...p, punching: false })), 120);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [player, gameOver, win, lastPunch]);

  // Game logic
  useEffect(() => {
    if (gameOver || win) return;
    const interval = setInterval(() => {
      // Punch logic
      if (player.punching) {
        setBuildings(bs => bs.map(b => {
          if (!b.destroyed && Math.abs(player.x + player.punchDir * PUNCH_RANGE - (b.x + b.w / 2)) < b.w / 2 && Math.abs(player.y - (b.y + b.h / 2)) < b.h / 2) {
            setScore(s => s + 100);
            return { ...b, destroyed: true };
          }
          return b;
        }));
      }
      // Enemy logic
      setEnemies(es => es.map(e => {
        if (!e.alive) return e;
        let nx = e.x + e.vx;
        let ny = e.y + e.vy;
        if (nx < ENEMY_SIZE / 2 || nx > GAME_WIDTH - ENEMY_SIZE / 2) e.vx *= -1;
        if (ny > GAME_HEIGHT - ENEMY_SIZE / 2) {
          ny = 0;
          nx = Math.random() * (GAME_WIDTH - ENEMY_SIZE);
        }
        // Collision with player
        if (Math.abs(nx - player.x) < (PLAYER_SIZE + ENEMY_SIZE) / 2 && Math.abs(ny - player.y) < (PLAYER_SIZE + ENEMY_SIZE) / 2) {
          setPlayer(p => ({ ...p, health: Math.max(0, p.health - 18) }));
        }
        return { ...e, x: nx, y: ny };
      }));
      // Add new enemies
      if (Math.random() < 0.04 && enemies.length < 6) {
        setEnemies(es => [...es, randomEnemy()]);
      }
      // Win/lose
      if (player.health <= 0) {
        setGameOver(true);
        submitScoreSupabase('Rampage', userId, score);
      }
      if (buildings.every(b => b.destroyed)) {
        setWin(true);
        submitScoreSupabase('Rampage', userId, score + 500);
        setScore(s => s + 500);
      }
    }, 32);
    return () => clearInterval(interval);
  }, [player, buildings, enemies, score, userId, gameOver, win]);

  // Restart
  function restart() {
    setPlayer({ x: 80, y: 320, health: MAX_HEALTH, punching: false, punchDir: 1 });
    setBuildings(getBuildings());
    setEnemies([randomEnemy()]);
    setScore(0);
    setGameOver(false);
    setWin(false);
    setLastPunch(0);
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Rampage</h2>
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} style={{ background: '#7ec0ee', border: '3px solid #b5651d', marginBottom: 10 }} />
      <div style={{ color: '#222', marginBottom: 8 }}>
        Arrow keys/A/D: Move. Space/Z: Punch. Destroy all buildings. Avoid helicopters!
      </div>
  <LeaderboardMini game="Rampage" />
      <button onClick={restart} style={{ margin: 8 }}>Restart</button>
    </div>
  );
};

export default Rampage;
