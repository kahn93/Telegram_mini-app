import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import { submitScoreSupabase } from './leaderboardSupabase';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 480;
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 32;
const ENEMY_WIDTH = 32;
const ENEMY_HEIGHT = 32;
const PLATFORM_HEIGHT = 12;
const GRAVITY = 0.5;
const FLAP_VELOCITY = -7.5;
const PLAYER_SPEED = 2.5;
const ENEMY_SPEED = 1.7;
const PLATFORMS = [
  { y: 440, left: 0, right: 400 },
  { y: 340, left: 40, right: 360 },
  { y: 260, left: 0, right: 400 },
  { y: 180, left: 40, right: 360 },
  { y: 100, left: 0, right: 400 },
];

interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
  ai?: boolean;
}

function rectsOverlap(a: Entity, b: Entity) {
  return (
    a.x < b.x + ENEMY_WIDTH &&
    a.x + PLAYER_WIDTH > b.x &&
    a.y < b.y + ENEMY_HEIGHT &&
    a.y + PLAYER_HEIGHT > b.y
  );
}

const Joust: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [running, setRunning] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [player, setPlayer] = useState<Entity>({ x: 60, y: 400, vx: 0, vy: 0, alive: true });
  const [enemies, setEnemies] = useState<Entity[]>([
    { x: 300, y: 400, vx: -ENEMY_SPEED, vy: 0, alive: true, ai: true },
    { x: 200, y: 340, vx: ENEMY_SPEED, vy: 0, alive: true, ai: true },
    { x: 100, y: 180, vx: ENEMY_SPEED, vy: 0, alive: true, ai: true },
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
  }, [running, player, enemies, gameOver, win]);

  function update(dt: number) {
    if (gameOver || win) return;
    const p = { ...player };
    // Movement
    if (keys.current['ArrowLeft']) p.vx = -PLAYER_SPEED;
    else if (keys.current['ArrowRight']) p.vx = PLAYER_SPEED;
    else p.vx = 0;
    if (keys.current[' '] && p.vy > -2) p.vy = FLAP_VELOCITY;
    // Gravity
    p.vy += GRAVITY * dt;
    p.x += p.vx * dt * 2;
    p.y += p.vy * dt * 2;
    // Clamp
    p.x = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, p.x));
    // Platforms
    for (const plat of PLATFORMS) {
      if (
        p.y + PLAYER_HEIGHT >= plat.y &&
        p.y + PLAYER_HEIGHT <= plat.y + PLATFORM_HEIGHT + 4 &&
        p.x + PLAYER_WIDTH > plat.left &&
        p.x < plat.right
      ) {
        p.y = plat.y - PLAYER_HEIGHT;
        p.vy = 0;
        break;
      }
    }
    // Enemies
    const newEnemies = enemies.map(e => ({ ...e }));
    for (const e of newEnemies) {
      if (!e.alive) continue;
      // AI: move left/right, flap randomly
      if (e.ai) {
        if (Math.random() < 0.02) e.vy = FLAP_VELOCITY * (0.7 + Math.random() * 0.6);
        e.x += e.vx * dt * 2;
        e.y += e.vy * dt * 2;
        e.vy += GRAVITY * dt;
        // Bounce off walls
        if (e.x < 0 || e.x > GAME_WIDTH - ENEMY_WIDTH) e.vx *= -1;
        // Platforms
        for (const plat of PLATFORMS) {
          if (
            e.y + ENEMY_HEIGHT >= plat.y &&
            e.y + ENEMY_HEIGHT <= plat.y + PLATFORM_HEIGHT + 4 &&
            e.x + ENEMY_WIDTH > plat.left &&
            e.x < plat.right
          ) {
            e.y = plat.y - ENEMY_HEIGHT;
            e.vy = 0;
            break;
          }
        }
      }
      // Collisions
      if (rectsOverlap(p, e) && e.alive && p.alive) {
        if (p.y + PLAYER_HEIGHT - 8 < e.y + 8) {
          // Player is above enemy
          e.alive = false;
          setScore(s => s + 500);
        } else {
          // Enemy is above player
          setPlayer(pl => ({ ...pl, alive: false }));
          setGameOver(true);
          setRunning(false);
          return;
        }
      }
    }
    // Win
    if (newEnemies.every(e => !e.alive)) {
      setWin(true);
      setRunning(false);
      setScore(s => s + 1000);
    }
    setPlayer(p);
    setEnemies(newEnemies);
  }

  function draw() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Platforms
    for (const plat of PLATFORMS) {
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(plat.left, plat.y, plat.right - plat.left, PLATFORM_HEIGHT);
    }
    // Player
    if (player.alive) {
      ctx.save();
      ctx.translate(player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT / 2);
      ctx.rotate(Math.sin(Date.now() / 120) * 0.1);
      ctx.fillStyle = '#0ff';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('🦅', -14, 10);
      ctx.restore();
    }
    // Enemies
    for (const e of enemies) {
      if (!e.alive) continue;
      ctx.save();
      ctx.translate(e.x + ENEMY_WIDTH / 2, e.y + ENEMY_HEIGHT / 2);
      ctx.rotate(Math.sin(Date.now() / 100 + e.x) * 0.1);
      ctx.fillStyle = '#f55';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('🦅', -14, 10);
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
      ctx.fillText('Joust (Mini)', 140, 150);
      ctx.font = '14px sans-serif';
      ctx.fillText('Arrow keys: Move', 80, 180);
      ctx.fillText('Space: Flap', 80, 200);
      ctx.fillText('Land on enemies to defeat them!', 80, 220);
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
    setPlayer({ x: 60, y: 400, vx: 0, vy: 0, alive: true });
    setEnemies([
      { x: 300, y: 400, vx: -ENEMY_SPEED, vy: 0, alive: true, ai: true },
      { x: 200, y: 340, vx: ENEMY_SPEED, vy: 0, alive: true, ai: true },
      { x: 100, y: 180, vx: ENEMY_SPEED, vy: 0, alive: true, ai: true },
    ]);
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
      await submitScoreSupabase('joust', userId, score);
    } catch {
      // Error intentionally ignored
    }
    setSubmitting(false);
  }

  return (
    <div className="arcade-game-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Joust</h2>
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        style={{ border: '2px solid #fff', background: '#1a1a2e', marginBottom: 16, maxWidth: '100%', height: 'auto' }}
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
        <LeaderboardMini gameId="joust" />
      </div>
    </div>
  );
};

export default Joust;
