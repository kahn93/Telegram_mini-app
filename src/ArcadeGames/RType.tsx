import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import { submitScoreSupabase } from './leaderboardSupabase';

// R-Type (mini) constants
const GAME_WIDTH = 480;
const GAME_HEIGHT = 320;
const PLAYER_SIZE = 28;
const ENEMY_SIZE = 28;
const BULLET_SIZE = 8;
const PLAYER_SPEED = 3.2;
const BULLET_SPEED = 6.2;
const ENEMY_SPEED = 2.1;
const ENEMY_SPAWN_INTERVAL = 1200;
const MAX_HEALTH = 3;

const RType: React.FC<{ userId: string }> = ({ userId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState({ x: 60, y: GAME_HEIGHT / 2, health: MAX_HEALTH });
  const [bullets, setBullets] = useState<{ x: number; y: number }[]>([]);
  const [enemies, setEnemies] = useState<{ x: number; y: number; alive: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [lastShot, setLastShot] = useState(0);

  // Draw
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Background
    ctx.fillStyle = '#001a33';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_SIZE / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#00eaff';
    ctx.fillText('🚀', -14, 10);
    ctx.restore();
    // Bullets
    bullets.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(0, 0, BULLET_SIZE / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    });
    // Enemies
    enemies.forEach(e => {
      if (!e.alive) return;
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.fillStyle = '#f55';
      ctx.beginPath();
      ctx.arc(0, 0, ENEMY_SIZE / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('👾', -12, 10);
      ctx.restore();
    });
    // Health
    ctx.save();
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Health: ${player.health}`, 20, 28);
    ctx.restore();
    // Score
    ctx.save();
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Score: ${score}`, 340, 28);
    ctx.restore();
    if (gameOver) {
      ctx.save();
      ctx.font = '32px Arial';
      ctx.fillStyle = '#f00';
      ctx.fillText('Game Over!', 140, 160);
      ctx.font = '20px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText('Press R to restart', 150, 200);
      ctx.restore();
    }
    if (win) {
      ctx.save();
      ctx.font = '32px Arial';
      ctx.fillStyle = '#0f0';
      ctx.fillText('You Win!', 160, 160);
      ctx.font = '20px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText('Press R to restart', 150, 200);
      ctx.restore();
    }
  }, [player, bullets, enemies, score, gameOver, win]);

  // Keyboard
  useEffect(() => {
    if (gameOver || win) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') { restart(); return; }
      let dy = 0;
      if (e.key === 'ArrowUp' || e.key === 'w') dy = -PLAYER_SPEED;
      else if (e.key === 'ArrowDown' || e.key === 's') dy = PLAYER_SPEED;
      if (dy !== 0) {
        setPlayer(p => ({ ...p, y: Math.max(PLAYER_SIZE / 2, Math.min(GAME_HEIGHT - PLAYER_SIZE / 2, p.y + dy)) }));
      }
      if (e.key === ' ' && Date.now() - lastShot > 180) {
        setBullets(bs => [...bs, { x: player.x + PLAYER_SIZE / 2, y: player.y }]);
        setLastShot(Date.now());
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [player, gameOver, win, lastShot]);

  // Game logic
  useEffect(() => {
    if (gameOver || win) return;
    const interval = setInterval(() => {
      // Move bullets
      setBullets(bs => bs.map(b => ({ ...b, x: b.x + BULLET_SPEED })).filter(b => b.x < GAME_WIDTH));
      // Move enemies
      setEnemies(es => es.map(e => ({ ...e, x: e.x - ENEMY_SPEED })).filter(e => e.x > -ENEMY_SIZE));
      // Bullet-enemy collision
      setEnemies(es => es.map(e => {
        if (!e.alive) return e;
        for (const b of bullets) {
          if (Math.abs(b.x - e.x) < (ENEMY_SIZE + BULLET_SIZE) / 2 && Math.abs(b.y - e.y) < (ENEMY_SIZE + BULLET_SIZE) / 2) {
            setScore(s => s + 200);
            return { ...e, alive: false };
          }
        }
        return e;
      }));
      // Enemy-player collision
      setEnemies(es => es.map(e => {
        if (!e.alive) return e;
        if (Math.abs(player.x - e.x) < (PLAYER_SIZE + ENEMY_SIZE) / 2 && Math.abs(player.y - e.y) < (PLAYER_SIZE + ENEMY_SIZE) / 2) {
          setPlayer(p => ({ ...p, health: Math.max(0, p.health - 1) }));
          return { ...e, alive: false };
        }
        return e;
      }));
      // Win/lose
      if (player.health <= 0) {
        setGameOver(true);
        submitScoreSupabase('RType', userId, score);
      }
      if (score >= 2000) {
        setWin(true);
        submitScoreSupabase('RType', userId, score + 500);
        setScore(s => s + 500);
      }
    }, 32);
    return () => clearInterval(interval);
  }, [player, bullets, enemies, score, userId, gameOver, win]);

  // Enemy spawn
  useEffect(() => {
    if (gameOver || win) return;
    const interval = setInterval(() => {
      setEnemies(es => [...es, { x: GAME_WIDTH - ENEMY_SIZE / 2, y: Math.random() * (GAME_HEIGHT - ENEMY_SIZE) + ENEMY_SIZE / 2, alive: true }]);
    }, ENEMY_SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [gameOver, win]);

  // Restart
  function restart() {
    setPlayer({ x: 60, y: GAME_HEIGHT / 2, health: MAX_HEALTH });
    setBullets([]);
    setEnemies([]);
    setScore(0);
    setGameOver(false);
    setWin(false);
    setLastShot(0);
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>R-Type</h2>
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} style={{ background: '#001a33', border: '3px solid #00eaff', marginBottom: 10 }} />
      <div style={{ color: '#fff', marginBottom: 8 }}>
        Arrow keys/W/S: Move up/down. Space: Shoot. Survive and score 2000 points!
      </div>
  <LeaderboardMini game="RType" />
      <button onClick={restart} style={{ margin: 8 }}>Restart</button>
    </div>
  );
};

export default RType;
