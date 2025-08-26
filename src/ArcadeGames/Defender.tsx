import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import { submitScoreSupabase } from './leaderboardSupabase';
import { playSound, isMuted } from '../soundManager';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 480;
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 16;
const ENEMY_WIDTH = 28;
const ENEMY_HEIGHT = 16;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 8;
const PLAYER_SPEED = 3.5;
const BULLET_SPEED = 7;
const ENEMY_SPEED = 1.7;
const ENEMY_BULLET_SPEED = 2.5;
const ENEMY_FIRE_CHANCE = 0.012;
const HUMAN_WIDTH = 10;
const HUMAN_HEIGHT = 14;
const HUMANS = [
  { x: 60, y: GAME_HEIGHT - 30, rescued: false },
  { x: 200, y: GAME_HEIGHT - 30, rescued: false },
  { x: 340, y: GAME_HEIGHT - 30, rescued: false },
];

interface Bullet {
  x: number;
  y: number;
  vy: number;
  fromEnemy: boolean;
}

interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
  carrying?: boolean;
}

interface Human {
  x: number;
  y: number;
  rescued: boolean;
}

interface DefenderProps {
  userid?: string;
  muted?: boolean;
}
const Defender: React.FC<DefenderProps> = ({ userid: propUserId, muted }) => {
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
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [running, setRunning] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [playerY, setPlayerY] = useState(GAME_HEIGHT - 60);
  const [playerLives, setPlayerLives] = useState(3);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([
    { x: 60, y: 80, vx: ENEMY_SPEED, vy: 0, alive: true },
    { x: 200, y: 120, vx: -ENEMY_SPEED, vy: 0, alive: true },
    { x: 340, y: 60, vx: ENEMY_SPEED, vy: 0, alive: true },
  ]);
  const [humans, setHumans] = useState<Human[]>(JSON.parse(JSON.stringify(HUMANS)));
  const keys = useRef<{ [k: string]: boolean }>({});

  // Keyboard
  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      if (e.key === ' ' || e.key === 'ArrowUp') setShowInstructions(false);
      if (!muted && !isMuted()) playSound('button');
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
  }, [muted]);

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
  }, [running, playerX, playerY, bullets, enemies, humans, gameOver, win]);

  const [showGameOverEffect, setShowGameOverEffect] = useState(false);
  const [showScorePop, setShowScorePop] = useState(false);

  function update(dt: number) {
    if (gameOver || win) return;
    let px = playerX;
    let py = playerY;
    // Player movement
    if (keys.current['ArrowLeft']) px -= PLAYER_SPEED * dt * 2;
    if (keys.current['ArrowRight']) px += PLAYER_SPEED * dt * 2;
    if (keys.current['ArrowUp']) py -= PLAYER_SPEED * dt * 2;
    if (keys.current['ArrowDown']) py += PLAYER_SPEED * dt * 2;
    px = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, px));
    py = Math.max(0, Math.min(GAME_HEIGHT - PLAYER_HEIGHT, py));
    setPlayerX(px);
    setPlayerY(py);
    // Fire
    if (keys.current[' '] && bullets.filter(b => !b.fromEnemy).length < 2) {
      setBullets(bullets => [
        ...bullets,
        { x: px + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2, y: py, vy: -BULLET_SPEED, fromEnemy: false },
      ]);
      keys.current[' '] = false;
      if (!muted && !isMuted()) playSound('spin');
    }
    // Bullets
    let newBullets = bullets.map(b => ({ ...b, y: b.y + b.vy * dt * 2 }));
    newBullets = newBullets.filter(b => b.y > -BULLET_HEIGHT && b.y < GAME_HEIGHT + BULLET_HEIGHT);
    // Enemy movement
    const newEnemies = enemies.map(e => ({ ...e }));
    for (const e of newEnemies) {
      if (!e.alive) continue;
      e.x += e.vx * dt * 2;
      e.y += e.vy * dt * 2;
      // Bounce off walls
      if (e.x < 0 || e.x > GAME_WIDTH - ENEMY_WIDTH) e.vx *= -1;
      // Enemy fire
      if (Math.random() < ENEMY_FIRE_CHANCE * dt) {
        setBullets(bullets => [
          ...bullets,
          { x: e.x + ENEMY_WIDTH / 2 - BULLET_WIDTH / 2, y: e.y + ENEMY_HEIGHT, vy: ENEMY_BULLET_SPEED, fromEnemy: true },
        ]);
      }
      // Carry human
      for (const h of humans) {
        if (!h.rescued && Math.abs(e.x - h.x) < 12 && Math.abs(e.y - h.y) < 12) {
          e.carrying = true;
          h.y -= 1.2 * dt;
          if (h.y < 0) {
            h.rescued = true;
            setScore(s => s - 500);
          }
        }
      }
    }
    setEnemies(newEnemies);
    // Bullet collisions
    for (const b of newBullets) {
      if (!b.fromEnemy) {
        for (const e of newEnemies) {
          if (
            e.alive &&
            b.x < e.x + ENEMY_WIDTH &&
            b.x + BULLET_WIDTH > e.x &&
            b.y < e.y + ENEMY_HEIGHT &&
            b.y + BULLET_HEIGHT > e.y
          ) {
            e.alive = false;
            b.y = -1000;
            setScore(s => s + 500);
            if (!muted && !isMuted()) playSound('win');
            setShowScorePop(true);
            setTimeout(() => setShowScorePop(false), 500);
          }
        }
      } else {
        // Enemy bullet hits player
        if (
          b.x < px + PLAYER_WIDTH &&
          b.x + BULLET_WIDTH > px &&
          b.y < py + PLAYER_HEIGHT &&
          b.y + BULLET_HEIGHT > py
        ) {
          setPlayerLives(l => l - 1);
          b.y = GAME_HEIGHT + 1000;
          if (!muted && !isMuted()) playSound('die');
        }
      }
    }
    setBullets(newBullets);
    // Rescue humans
    const newHumans = humans.map(h => ({ ...h }));
    for (const h of newHumans) {
      if (!h.rescued && Math.abs(px - h.x) < 16 && Math.abs(py - h.y) < 16) {
        h.rescued = true;
        setScore(s => s + 1000);
        if (!muted && !isMuted()) playSound('bonus');
      }
    }
    setHumans(newHumans);
    // Win/lose
    if (newEnemies.every(e => !e.alive) && newHumans.every(h => h.rescued)) {
      setWin(true);
      setRunning(false);
      setScore(s => s + 2000);
      setShowGameOverEffect(true);
      if (!muted && !isMuted()) playSound('bonus');
      setTimeout(() => setShowGameOverEffect(false), 1200);
    }
    if (playerLives <= 0 || newHumans.every(h => h.rescued && h.y < 0)) {
      setGameOver(true);
      setRunning(false);
      setShowGameOverEffect(true);
      if (!muted && !isMuted()) playSound('die');
      setTimeout(() => setShowGameOverEffect(false), 1200);
    }
  }

  function draw() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Ground
    ctx.fillStyle = '#2ecc40';
    ctx.fillRect(0, GAME_HEIGHT - 20, GAME_WIDTH, 20);
    // Humans
    for (const h of humans) {
      if (h.rescued) continue;
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.fillStyle = '#fff';
      ctx.fillRect(-HUMAN_WIDTH / 2, -HUMAN_HEIGHT / 2, HUMAN_WIDTH, HUMAN_HEIGHT);
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#f39c12';
      ctx.fillText('🧑', -7, 10);
      ctx.restore();
    }
    // Enemies
    for (const e of enemies) {
      if (!e.alive) continue;
      ctx.save();
      ctx.translate(e.x + ENEMY_WIDTH / 2, e.y + ENEMY_HEIGHT / 2);
      ctx.fillStyle = '#f00';
      ctx.beginPath();
      ctx.ellipse(0, 0, ENEMY_WIDTH / 2, ENEMY_HEIGHT / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('👾', -10, 7);
      ctx.restore();
    }
    // Player
    ctx.save();
    ctx.translate(playerX + PLAYER_WIDTH / 2, playerY + PLAYER_HEIGHT / 2);
    ctx.fillStyle = '#0ff';
    ctx.beginPath();
    ctx.ellipse(0, 0, PLAYER_WIDTH / 2, PLAYER_HEIGHT / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('🚀', -12, 8);
    ctx.restore();
    // Bullets
    for (const b of bullets) {
      ctx.fillStyle = b.fromEnemy ? '#f33' : '#ff0';
      ctx.fillRect(b.x, b.y, BULLET_WIDTH, BULLET_HEIGHT);
    }
    // Score/lives
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.save();
  if (showScorePop) ctx.shadowColor = '#ffe259', ctx.shadowBlur = 16;
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.restore();
  ctx.fillText(`Lives: ${playerLives}`, 320, 20);
    if (showInstructions) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(30, 120, 340, 120);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Defender (Mini)', 120, 150);
      ctx.font = '14px sans-serif';
      ctx.fillText('Arrow keys: Move', 80, 180);
      ctx.fillText('Space: Fire', 80, 200);
      ctx.fillText('Rescue humans, destroy invaders!', 80, 220);
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
  }

  function restart() {
    setPlayerX(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
    setPlayerY(GAME_HEIGHT - 60);
    setPlayerLives(3);
    setBullets([]);
    setScore(0);
    setGameOver(false);
    setWin(false);
    setRunning(true);
    setShowInstructions(true);
    setShowGameOverEffect(false);
    if (!muted && !isMuted()) playSound('button');
    setEnemies([
      { x: 60, y: 80, vx: ENEMY_SPEED, vy: 0, alive: true },
      { x: 200, y: 120, vx: -ENEMY_SPEED, vy: 0, alive: true },
      { x: 340, y: 60, vx: ENEMY_SPEED, vy: 0, alive: true },
    ]);
    setHumans(JSON.parse(JSON.stringify(HUMANS)));
  }

  async function handleSubmitScore() {
    setSubmitting(true);
    try {
      const id = userId || localStorage.getItem('userId') || 'anon';
      await submitScoreSupabase('defender', id, score);
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
      <h2 style={{ color: '#fd79a8', textShadow: '0 0 8px #fff', marginBottom: 8, zIndex: 2, position: 'relative' }}>Defender</h2>
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
        <LeaderboardMini gameId="defender" />
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

export default Defender;
