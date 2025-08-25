import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import { submitScoreSupabase } from './leaderboardSupabase';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 480;
const PLAYER_SIZE = 24;
const ENEMY_SIZE = 22;
const BULLET_SIZE = 5;
const PLAYER_SPEED = 2.7;
const BULLET_SPEED = 6.5;
const ENEMY_SPEED = 1.5;
const ENEMY_FIRE_CHANCE = 0.01;
const ENEMY_BULLET_SPEED = 2.5;
const OBSTACLES = [
  { x: 120, y: 200, w: 40, h: 20 },
  { x: 260, y: 320, w: 60, h: 20 },
];

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fromEnemy: boolean;
}

interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
}

const Commando: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [running, setRunning] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [player, setPlayer] = useState({ x: 200, y: 420, vx: 0, vy: 0, alive: true });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([
    { x: 80, y: 80, vx: ENEMY_SPEED, vy: 0, alive: true },
    { x: 320, y: 160, vx: -ENEMY_SPEED, vy: 0, alive: true },
    { x: 200, y: 240, vx: ENEMY_SPEED, vy: 0, alive: true },
  ]);
  const keys = useRef<{ [k: string]: boolean }>({});

  // Keyboard
  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      if (e.key === ' ' || e.key === 'ArrowUp') setShowInstructions(false);
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
    let last = performance.now();
    function loop(now: number) {
      const dt = Math.min((now - last) / 16, 2);
      last = now;
      update(dt);
      draw();
      if (running) anim = requestAnimationFrame(loop);
    }
    anim = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(anim);
    // eslint-disable-next-line
  }, [running, player, bullets, enemies, gameOver, win]);

  function update(dt: number) {
    if (gameOver || win) return;
    const p = { ...player };
    // Movement
    p.vx = 0; p.vy = 0;
    if (keys.current['ArrowLeft']) p.vx = -PLAYER_SPEED;
    if (keys.current['ArrowRight']) p.vx = PLAYER_SPEED;
    if (keys.current['ArrowUp']) p.vy = -PLAYER_SPEED;
    if (keys.current['ArrowDown']) p.vy = PLAYER_SPEED;
    // Obstacle collision
    const nextX = p.x + p.vx * dt * 2;
    const nextY = p.y + p.vy * dt * 2;
    let blocked = false;
    for (const o of OBSTACLES) {
      if (
        nextX < o.x + o.w &&
        nextX + PLAYER_SIZE > o.x &&
        nextY < o.y + o.h &&
        nextY + PLAYER_SIZE > o.y
      ) blocked = true;
    }
    if (!blocked) {
      p.x = Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, nextX));
      p.y = Math.max(0, Math.min(GAME_HEIGHT - PLAYER_SIZE, nextY));
    }
    setPlayer(p);
    // Fire
    if (keys.current[' '] && bullets.filter(b => !b.fromEnemy).length < 2) {
      setBullets(bullets => [
        ...bullets,
        { x: p.x + PLAYER_SIZE / 2 - BULLET_SIZE / 2, y: p.y, vx: 0, vy: -BULLET_SPEED, fromEnemy: false },
      ]);
      keys.current[' '] = false;
    }
    // Bullets
    let newBullets = bullets.map(b => ({ ...b, x: b.x + b.vx * dt * 2, y: b.y + b.vy * dt * 2 }));
    newBullets = newBullets.filter(b => b.y > -BULLET_SIZE && b.y < GAME_HEIGHT + BULLET_SIZE);
    // Enemy movement
    const newEnemies = enemies.map(e => ({ ...e }));
    for (const e of newEnemies) {
      if (!e.alive) continue;
      e.x += e.vx * dt * 2;
      // Bounce off walls
      if (e.x < 0 || e.x > GAME_WIDTH - ENEMY_SIZE) e.vx *= -1;
      // Enemy fire
      if (Math.random() < ENEMY_FIRE_CHANCE * dt) {
        setBullets(bullets => [
          ...bullets,
          { x: e.x + ENEMY_SIZE / 2 - BULLET_SIZE / 2, y: e.y + ENEMY_SIZE, vx: 0, vy: ENEMY_BULLET_SPEED, fromEnemy: true },
        ]);
      }
    }
    setEnemies(newEnemies);
    // Bullet collisions
    for (const b of newBullets) {
      if (!b.fromEnemy) {
        for (const e of newEnemies) {
          if (
            e.alive &&
            b.x < e.x + ENEMY_SIZE &&
            b.x + BULLET_SIZE > e.x &&
            b.y < e.y + ENEMY_SIZE &&
            b.y + BULLET_SIZE > e.y
          ) {
            e.alive = false;
            b.y = -1000;
            setScore(s => s + 500);
          }
        }
      } else {
        // Enemy bullet hits player
        if (
          b.x < p.x + PLAYER_SIZE &&
          b.x + BULLET_SIZE > p.x &&
          b.y < p.y + PLAYER_SIZE &&
          b.y + BULLET_SIZE > p.y
        ) {
          setPlayer(pl => ({ ...pl, alive: false }));
          setGameOver(true);
          setRunning(false);
          return;
        }
      }
    }
    setBullets(newBullets);
    // Win/lose
    if (newEnemies.every(e => !e.alive)) {
      setWin(true);
      setRunning(false);
      setScore(s => s + 2000);
    }
  }

  function draw() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Background
    ctx.fillStyle = '#2e2e2e';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Obstacles
    for (const o of OBSTACLES) {
      ctx.fillStyle = '#8d5524';
      ctx.fillRect(o.x, o.y, o.w, o.h);
    }
    // Enemies
    for (const e of enemies) {
      if (!e.alive) continue;
      ctx.save();
      ctx.translate(e.x + ENEMY_SIZE / 2, e.y + ENEMY_SIZE / 2);
      ctx.fillStyle = '#f00';
      ctx.beginPath();
      ctx.arc(0, 0, ENEMY_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('👮', -10, 7);
      ctx.restore();
    }
    // Player
    if (player.alive) {
      ctx.save();
      ctx.translate(player.x + PLAYER_SIZE / 2, player.y + PLAYER_SIZE / 2);
      ctx.fillStyle = '#0ff';
      ctx.beginPath();
      ctx.arc(0, 0, PLAYER_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('🪖', -12, 8);
      ctx.restore();
    }
    // Bullets
    for (const b of bullets) {
      ctx.fillStyle = b.fromEnemy ? '#f33' : '#ff0';
      ctx.fillRect(b.x, b.y, BULLET_SIZE, BULLET_SIZE);
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
      ctx.fillText('Commando (Mini)', 120, 150);
      ctx.font = '14px sans-serif';
      ctx.fillText('Arrow keys: Move', 80, 180);
      ctx.fillText('Space: Fire', 80, 200);
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
    setPlayer({ x: 200, y: 420, vx: 0, vy: 0, alive: true });
    setBullets([]);
    setScore(0);
    setGameOver(false);
    setWin(false);
    setRunning(true);
    setShowInstructions(true);
    setEnemies([
      { x: 80, y: 80, vx: ENEMY_SPEED, vy: 0, alive: true },
      { x: 320, y: 160, vx: -ENEMY_SPEED, vy: 0, alive: true },
      { x: 200, y: 240, vx: ENEMY_SPEED, vy: 0, alive: true },
    ]);
  }

  async function handleSubmitScore() {
    setSubmitting(true);
    try {
      const userId = localStorage.getItem('userId') || 'anon';
      await submitScoreSupabase('commando', userId, score);
    } catch {
      // Error intentionally ignored
    }
    setSubmitting(false);
  }

  return (
    <div className="arcade-game-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Commando</h2>
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        style={{ border: '2px solid #fff', background: '#2e2e2e', marginBottom: 16, maxWidth: '100%', height: 'auto' }}
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
        <LeaderboardMini gameId="commando" />
      </div>
    </div>
  );
};

export default Commando;
