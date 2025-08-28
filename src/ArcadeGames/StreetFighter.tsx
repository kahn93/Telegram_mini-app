import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import { submitScoreSupabase } from './leaderboardSupabase';

// Street Fighter (mini) constants
const GAME_WIDTH = 480;
const GAME_HEIGHT = 320;
const PLAYER_SIZE = 38;
const ENEMY_SIZE = 38;
const GROUND_Y = 240;
const PLAYER_SPEED = 3.2;
const JUMP_VEL = -7.5;
const GRAVITY = 0.5;
const ATTACK_RANGE = 44;
const ATTACK_COOLDOWN = 400;
const MAX_HEALTH = 100;

const ENEMY_AI_DELAY = 32;

const sprites = {
  player: '🥋',
  enemy: '🥊',
};

const StreetFighter: React.FC<{ userId: string }> = ({ userId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState(() => {
    const stored = localStorage.getItem('sf_player');
    return stored ? JSON.parse(stored) : { x: 100, y: GROUND_Y, vx: 0, vy: 0, health: MAX_HEALTH, attacking: false, facing: 1, onGround: true };
  });
  const [enemy, setEnemy] = useState(() => {
    const stored = localStorage.getItem('sf_enemy');
    return stored ? JSON.parse(stored) : { x: 340, y: GROUND_Y, vx: 0, vy: 0, health: MAX_HEALTH, attacking: false, facing: -1, onGround: true };
  });
  const [score, setScore] = useState(() => {
    const stored = localStorage.getItem('sf_score');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(() => {
    const stored = localStorage.getItem('sf_gameOver');
    return stored ? JSON.parse(stored) : false;
  });
  const [win, setWin] = useState(() => {
    const stored = localStorage.getItem('sf_win');
    return stored ? JSON.parse(stored) : false;
  });
  const [lastAttack, setLastAttack] = useState(() => {
    const stored = localStorage.getItem('sf_lastAttack');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [lastEnemyAttack, setLastEnemyAttack] = useState(() => {
    const stored = localStorage.getItem('sf_lastEnemyAttack');
    return stored ? parseInt(stored, 10) : 0;
  });
  // Auto-save logic
  useEffect(() => {
    localStorage.setItem('sf_player', JSON.stringify(player));
  }, [player]);
  useEffect(() => {
    localStorage.setItem('sf_enemy', JSON.stringify(enemy));
  }, [enemy]);
  useEffect(() => {
    localStorage.setItem('sf_score', score.toString());
  }, [score]);
  useEffect(() => {
    localStorage.setItem('sf_gameOver', JSON.stringify(gameOver));
  }, [gameOver]);
  useEffect(() => {
    localStorage.setItem('sf_win', JSON.stringify(win));
  }, [win]);
  useEffect(() => {
    localStorage.setItem('sf_lastAttack', lastAttack.toString());
  }, [lastAttack]);
  useEffect(() => {
    localStorage.setItem('sf_lastEnemyAttack', lastEnemyAttack.toString());
  }, [lastEnemyAttack]);

  // Draw
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Background
    ctx.fillStyle = '#b3e0ff';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(0, GROUND_Y + PLAYER_SIZE / 2, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
    // Health bars
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.fillRect(30, 20, 104, 16);
    ctx.fillRect(GAME_WIDTH - 134, 20, 104, 16);
    ctx.fillStyle = '#f00';
    ctx.fillRect(32, 22, player.health, 12);
    ctx.fillRect(GAME_WIDTH - 132, 22, enemy.health, 12);
    ctx.strokeStyle = '#222';
    ctx.strokeRect(30, 20, 104, 16);
    ctx.strokeRect(GAME_WIDTH - 134, 20, 104, 16);
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = '#222';
    ctx.fillText('You', 60, 32);
    ctx.fillText('Enemy', GAME_WIDTH - 104, 32);
    ctx.restore();
    // Player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_SIZE / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#222';
    ctx.fillText(sprites.player, -18, 14);
    ctx.restore();
    // Player attack
    if (player.attacking) {
      ctx.save();
      ctx.strokeStyle = '#f00';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(player.x + player.facing * ATTACK_RANGE, player.y);
      ctx.stroke();
      ctx.restore();
    }
    // Enemy
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, ENEMY_SIZE / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#222';
    ctx.fillText(sprites.enemy, -18, 14);
    ctx.restore();
    // Enemy attack
    if (enemy.attacking) {
      ctx.save();
      ctx.strokeStyle = '#00f';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(enemy.x, enemy.y);
      ctx.lineTo(enemy.x + enemy.facing * ATTACK_RANGE, enemy.y);
      ctx.stroke();
      ctx.restore();
    }
    // Score
    ctx.save();
    ctx.font = '20px Arial';
    ctx.fillStyle = '#222';
    ctx.fillText(`Score: ${score}`, 200, 28);
    ctx.restore();
    if (gameOver) {
      ctx.save();
      ctx.font = '32px Arial';
      ctx.fillStyle = '#f00';
      ctx.fillText('Game Over!', 150, 160);
      ctx.font = '20px Arial';
      ctx.fillStyle = '#222';
      ctx.fillText('Press R to restart', 150, 200);
      ctx.restore();
    }
    if (win) {
      ctx.save();
      ctx.font = '32px Arial';
      ctx.fillStyle = '#0f0';
      ctx.fillText('You Win!', 160, 160);
      ctx.font = '20px Arial';
      ctx.fillStyle = '#222';
      ctx.fillText('Press R to restart', 150, 200);
      ctx.restore();
    }
  }, [player, enemy, score, gameOver, win]);

  // Keyboard
  useEffect(() => {
    if (gameOver || win) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') { restart(); return; }
      if (player.attacking) return;
      let dx = 0;
      if (e.key === 'ArrowLeft' || e.key === 'a') dx = -PLAYER_SPEED;
      else if (e.key === 'ArrowRight' || e.key === 'd') dx = PLAYER_SPEED;
      if (dx !== 0) {
  setPlayer((p: any) => ({ ...p, x: Math.max(PLAYER_SIZE / 2, Math.min(GAME_WIDTH - PLAYER_SIZE / 2, p.x + dx)), facing: dx > 0 ? 1 : -1 }));
      }
      if ((e.key === 'ArrowUp' || e.key === 'w') && player.onGround) {
  setPlayer((p: any) => ({ ...p, vy: JUMP_VEL, onGround: false }));
      }
      if (e.key === ' ' || e.key === 'z') {
        if (Date.now() - lastAttack > ATTACK_COOLDOWN) {
          setPlayer((p: any) => ({ ...p, attacking: true }));
          setLastAttack(Date.now());
          setTimeout(() => setPlayer((p: any) => ({ ...p, attacking: false })), 120);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [player, gameOver, win, lastAttack]);

  // Game logic
  useEffect(() => {
    if (gameOver || win) return;
    const interval = setInterval(() => {
      // Player jump/gravity
  setPlayer((p: any) => {
        let vy = p.vy + GRAVITY;
        let y = p.y + vy;
        const onGround = y >= GROUND_Y;
        if (onGround) { y = GROUND_Y; vy = 0; }
        return { ...p, y, vy, onGround };
      });
      // Enemy AI
  setEnemy((e: any) => {
        const dx = player.x > e.x ? PLAYER_SPEED : -PLAYER_SPEED;
        const facing = dx > 0 ? 1 : -1;
        const vx = dx;
        let vy = e.vy + GRAVITY;
        let y = e.y + vy;
        const onGround = y >= GROUND_Y;
        if (onGround) { y = GROUND_Y; vy = 0; }
        // Random jump
        if (onGround && Math.random() < 0.04) vy = JUMP_VEL;
        // Attack if close
        let attacking = false;
        if (Math.abs(player.x - e.x) < ATTACK_RANGE && Date.now() - lastEnemyAttack > ATTACK_COOLDOWN) {
          attacking = true;
          setLastEnemyAttack(Date.now());
          setTimeout(() => setEnemy((en: any) => ({ ...en, attacking: false })), 120);
        }
        return { ...e, x: Math.max(ENEMY_SIZE / 2, Math.min(GAME_WIDTH - ENEMY_SIZE / 2, e.x + vx)), y, vy, onGround, facing, attacking };
      });
      // Player attack logic
      if (player.attacking && Math.abs(player.x + player.facing * ATTACK_RANGE - enemy.x) < ENEMY_SIZE / 2 && Math.abs(player.y - enemy.y) < ENEMY_SIZE / 2) {
  setEnemy((e: any) => ({ ...e, health: Math.max(0, e.health - 18) }));
        setScore(s => s + 200);
      }
      // Enemy attack logic
      if (enemy.attacking && Math.abs(enemy.x + enemy.facing * ATTACK_RANGE - player.x) < PLAYER_SIZE / 2 && Math.abs(enemy.y - player.y) < PLAYER_SIZE / 2) {
  setPlayer((p: any) => ({ ...p, health: Math.max(0, p.health - 18) }));
      }
      // Win/lose
      if (player.health <= 0) {
        setGameOver(true);
  submitScoreSupabase('StreetFighter', userId, score);
      }
      if (enemy.health <= 0) {
        setWin(true);
  submitScoreSupabase('StreetFighter', userId, score + 500);
        setScore(s => s + 500);
      }
    }, ENEMY_AI_DELAY);
    return () => clearInterval(interval);
  }, [player, enemy, score, userId, gameOver, win, lastEnemyAttack]);

  // Restart
  function restart() {
    setPlayer({ x: 100, y: GROUND_Y, vx: 0, vy: 0, health: MAX_HEALTH, attacking: false, facing: 1, onGround: true });
    setEnemy({ x: 340, y: GROUND_Y, vx: 0, vy: 0, health: MAX_HEALTH, attacking: false, facing: -1, onGround: true });
    setScore(0);
    setGameOver(false);
    setWin(false);
    setLastAttack(0);
    setLastEnemyAttack(0);
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Street Fighter</h2>
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} style={{ background: '#b3e0ff', border: '3px solid #222', marginBottom: 10 }} />
      <div style={{ color: '#222', marginBottom: 8 }}>
        Arrow keys/A/D: Move. Up/W: Jump. Space/Z: Attack. Defeat the enemy!
      </div>
  <LeaderboardMini game="StreetFighter" />
      <button onClick={restart} style={{ margin: 8 }}>Restart</button>
    </div>
  );
};

export default StreetFighter;
