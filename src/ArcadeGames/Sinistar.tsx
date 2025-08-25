import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import { submitScoreSupabase } from './leaderboardSupabase';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 480;
const PLAYER_RADIUS = 16;
const ENEMY_RADIUS = 18;
const ASTEROID_RADIUS = 12;
const BULLET_RADIUS = 4;
const MAX_ASTEROIDS = 8;
const ENEMY_SPEED = 1.5;
const PLAYER_THRUST = 0.18;
const PLAYER_ROTATE_SPEED = 0.09;
const BULLET_SPEED = 5.5;
const ENEMY_FIRE_CHANCE = 0.01;

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle?: number;
  alive?: boolean;
}

const Sinistar: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [running, setRunning] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [player, setPlayer] = useState<Entity>({ x: 200, y: 400, vx: 0, vy: 0, angle: -Math.PI / 2, alive: true });
  const [bullets, setBullets] = useState<Entity[]>([]);
  const [enemy, setEnemy] = useState<Entity>({ x: 200, y: 80, vx: 0, vy: 0, angle: 0, alive: true });
  const [asteroids, setAsteroids] = useState<Entity[]>(() => {
    const arr: Entity[] = [];
    for (let i = 0; i < MAX_ASTEROIDS; ++i) {
      arr.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * (GAME_HEIGHT - 200) + 60,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
      });
    }
    return arr;
  });
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
  }, [running, player, bullets, enemy, asteroids, gameOver, win]);

  function update(dt: number) {
    if (gameOver || win) return;
    const p = { ...player };
    // Controls
    if (keys.current['ArrowLeft']) p.angle! -= PLAYER_ROTATE_SPEED * dt;
    if (keys.current['ArrowRight']) p.angle! += PLAYER_ROTATE_SPEED * dt;
    if (keys.current['ArrowUp']) {
      p.vx += Math.cos(p.angle!) * PLAYER_THRUST * dt * 2;
      p.vy += Math.sin(p.angle!) * PLAYER_THRUST * dt * 2;
    }
    // Friction
    p.vx *= 0.99;
    p.vy *= 0.99;
    p.x += p.vx * dt * 2;
    p.y += p.vy * dt * 2;
    // Wrap
    if (p.x < 0) p.x += GAME_WIDTH;
    if (p.x > GAME_WIDTH) p.x -= GAME_WIDTH;
    if (p.y < 0) p.y += GAME_HEIGHT;
    if (p.y > GAME_HEIGHT) p.y -= GAME_HEIGHT;
    // Fire
    if (keys.current[' '] && bullets.length < 3) {
      setBullets(bullets => [
        ...bullets,
        {
          x: p.x + Math.cos(p.angle!) * PLAYER_RADIUS,
          y: p.y + Math.sin(p.angle!) * PLAYER_RADIUS,
          vx: Math.cos(p.angle!) * BULLET_SPEED,
          vy: Math.sin(p.angle!) * BULLET_SPEED,
        },
      ]);
      keys.current[' '] = false;
    }
    // Bullets
    let newBullets = bullets.map(b => ({ ...b, x: b.x + b.vx * dt * 2, y: b.y + b.vy * dt * 2 }));
    newBullets = newBullets.filter(b => b.x > 0 && b.x < GAME_WIDTH && b.y > 0 && b.y < GAME_HEIGHT);
    // Asteroids
    const newAsteroids = asteroids.map(a => ({ ...a, x: a.x + a.vx * dt, y: a.y + a.vy * dt }));
    for (const a of newAsteroids) {
      if (a.x < 0) a.x += GAME_WIDTH;
      if (a.x > GAME_WIDTH) a.x -= GAME_WIDTH;
      if (a.y < 0) a.y += GAME_HEIGHT;
      if (a.y > GAME_HEIGHT) a.y -= GAME_HEIGHT;
    }
    // Bullet hits asteroid
    for (const b of newBullets) {
      for (const a of newAsteroids) {
        if (dist(b.x, b.y, a.x, a.y) < ASTEROID_RADIUS + BULLET_RADIUS) {
          a.x = Math.random() * GAME_WIDTH;
          a.y = Math.random() * (GAME_HEIGHT - 200) + 60;
          setScore(s => s + 100);
          b.x = -1000;
        }
      }
    }
    // Enemy AI
    const e = { ...enemy };
    if (e.alive) {
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      e.vx += (dx / d) * ENEMY_SPEED * 0.04 * dt;
      e.vy += (dy / d) * ENEMY_SPEED * 0.04 * dt;
      e.x += e.vx * dt * 2;
      e.y += e.vy * dt * 2;
      // Wrap
      if (e.x < 0) e.x += GAME_WIDTH;
      if (e.x > GAME_WIDTH) e.x -= GAME_WIDTH;
      if (e.y < 0) e.y += GAME_HEIGHT;
      if (e.y > GAME_HEIGHT) e.y -= GAME_HEIGHT;
      // Enemy collision with player
      if (dist(e.x, e.y, p.x, p.y) < ENEMY_RADIUS + PLAYER_RADIUS) {
        setPlayer(pl => ({ ...pl, alive: false }));
        setGameOver(true);
        setRunning(false);
        return;
      }
      // Enemy fire
      if (Math.random() < ENEMY_FIRE_CHANCE * dt) {
        setBullets(bullets => [
          ...bullets,
          {
            x: e.x,
            y: e.y,
            vx: (p.x - e.x) / d * BULLET_SPEED,
            vy: (p.y - e.y) / d * BULLET_SPEED,
          },
        ]);
      }
    }
    // Bullet hits enemy
    for (const b of newBullets) {
      if (e.alive && dist(b.x, b.y, e.x, e.y) < ENEMY_RADIUS + BULLET_RADIUS) {
        e.alive = false;
        setScore(s => s + 2000);
        setWin(true);
        setRunning(false);
      }
    }
    setPlayer(p);
    setBullets(newBullets);
    setAsteroids(newAsteroids);
    setEnemy(e);
  }

  function draw() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Stars
    for (let i = 0; i < 60; ++i) {
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.2 + 0.8 * Math.random();
      ctx.beginPath();
      ctx.arc(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Asteroids
    for (const a of asteroids) {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.arc(0, 0, ASTEROID_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('🪨', -10, 7);
      ctx.restore();
    }
    // Enemy
    if (enemy.alive) {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      ctx.rotate(Math.sin(Date.now() / 200) * 0.1);
      ctx.fillStyle = '#f00';
      ctx.beginPath();
      ctx.arc(0, 0, ENEMY_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('👹', -14, 12);
      ctx.restore();
    }
    // Player
    if (player.alive) {
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.angle!);
      ctx.fillStyle = '#0ff';
      ctx.beginPath();
      ctx.moveTo(PLAYER_RADIUS, 0);
      ctx.lineTo(-PLAYER_RADIUS / 2, PLAYER_RADIUS / 2);
      ctx.lineTo(-PLAYER_RADIUS / 2, -PLAYER_RADIUS / 2);
      ctx.closePath();
      ctx.fill();
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('🚀', -12, 8);
      ctx.restore();
    }
    // Bullets
    for (const b of bullets) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(0, 0, BULLET_RADIUS, 0, Math.PI * 2);
      ctx.fill();
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
      ctx.fillText('Sinistar (Mini)', 120, 150);
      ctx.font = '14px sans-serif';
      ctx.fillText('Arrow keys: Rotate/Thrust', 80, 180);
      ctx.fillText('Space: Fire', 80, 200);
      ctx.fillText('Destroy Sinistar and survive!', 80, 220);
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
    setPlayer({ x: 200, y: 400, vx: 0, vy: 0, angle: -Math.PI / 2, alive: true });
    setBullets([]);
    setEnemy({ x: 200, y: 80, vx: 0, vy: 0, angle: 0, alive: true });
    const arr: Entity[] = [];
    for (let i = 0; i < MAX_ASTEROIDS; ++i) {
      arr.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * (GAME_HEIGHT - 200) + 60,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
      });
    }
    setAsteroids(arr);
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
      await submitScoreSupabase('sinistar', userId, score);
    } catch {
      // Error intentionally ignored
    }
    setSubmitting(false);
  }

  return (
    <div className="arcade-game-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Sinistar</h2>
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        style={{ border: '2px solid #fff', background: '#000', marginBottom: 16, maxWidth: '100%', height: 'auto' }}
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
        <LeaderboardMini gameId="sinistar" />
      </div>
    </div>
  );
};

export default Sinistar;
