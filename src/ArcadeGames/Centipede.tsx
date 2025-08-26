import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import { submitScoreSupabase } from './leaderboardSupabase';
import { playSound, isMuted } from '../soundManager';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 480;
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 16;
const CENTIPEDE_SEGMENT = 18;
const CENTIPEDE_LENGTH = 12;
const BULLET_SIZE = 6;
const PLAYER_SPEED = 3.2;
const BULLET_SPEED = 7;
const MUSHROOM_SIZE = 18;
const MUSHROOMS = Array.from({ length: 24 }, (_, i) => ({
  x: 20 + (i % 8) * 45,
  y: 80 + Math.floor(i / 8) * 60,
  alive: true,
}));

interface Bullet {
  x: number;
  y: number;
  vy: number;
}

interface Segment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
}

interface CentipedeProps {
  userid?: string;
  muted?: boolean;
}
const Centipede: React.FC<CentipedeProps> = ({ userid: propUserId, muted }) => {
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
  const [playerY, setPlayerY] = useState(GAME_HEIGHT - 40);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [segments, setSegments] = useState<Segment[]>(() => {
    const arr: Segment[] = [];
    for (let i = 0; i < CENTIPEDE_LENGTH; ++i) {
      arr.push({
        x: 40 + i * (CENTIPEDE_SEGMENT + 2),
        y: 40,
        vx: 1.2,
        vy: 0,
        alive: true,
      });
    }
    return arr;
  });
  const [mushrooms, setMushrooms] = useState(
    MUSHROOMS.map(m => ({ ...m }))
  );
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
  }, [running, playerX, playerY, bullets, segments, mushrooms, gameOver, win]);

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
    py = Math.max(GAME_HEIGHT - 120, Math.min(GAME_HEIGHT - PLAYER_HEIGHT, py));
    setPlayerX(px);
    setPlayerY(py);
    // Fire
    if (keys.current[' '] && bullets.length < 2) {
      setBullets(bullets => [
        ...bullets,
        { x: px + PLAYER_WIDTH / 2 - BULLET_SIZE / 2, y: py, vy: -BULLET_SPEED },
      ]);
      keys.current[' '] = false;
      if (!muted && !isMuted()) playSound('spin');
    }
    // Bullets
    let newBullets = bullets.map(b => ({ ...b, y: b.y + b.vy * dt * 2 }));
    newBullets = newBullets.filter(b => b.y > -BULLET_SIZE && b.y < GAME_HEIGHT + BULLET_SIZE);
    // Centipede movement
    const newSegments = segments.map(s => ({ ...s }));
    for (let i = 0; i < newSegments.length; ++i) {
      const s = newSegments[i];
      if (!s.alive) continue;
      s.x += s.vx * dt * 2;
      // Wall or mushroom collision
      let hitWall = false;
      if (s.x < 0 || s.x > GAME_WIDTH - CENTIPEDE_SEGMENT) hitWall = true;
      for (const m of mushrooms) {
        if (
          m.alive &&
          s.x < m.x + MUSHROOM_SIZE &&
          s.x + CENTIPEDE_SEGMENT > m.x &&
          s.y < m.y + MUSHROOM_SIZE &&
          s.y + CENTIPEDE_SEGMENT > m.y
        ) {
          hitWall = true;
        }
      }
      if (hitWall) {
        s.vx *= -1;
        s.y += CENTIPEDE_SEGMENT + 2;
      }
      // Player collision
      if (
        s.x < px + PLAYER_WIDTH &&
        s.x + CENTIPEDE_SEGMENT > px &&
        s.y < py + PLAYER_HEIGHT &&
        s.y + CENTIPEDE_SEGMENT > py
      ) {
        setGameOver(true);
        setRunning(false);
        return;
      }
    }
    // Bullet collisions
    for (const b of newBullets) {
      // Segment hit
      for (const s of newSegments) {
        if (
          s.alive &&
          b.x < s.x + CENTIPEDE_SEGMENT &&
          b.x + BULLET_SIZE > s.x &&
          b.y < s.y + CENTIPEDE_SEGMENT &&
          b.y + BULLET_SIZE > s.y
        ) {
          s.alive = false;
          b.y = -1000;
          setScore(s => s + 100);
          if (!muted && !isMuted()) playSound('win');
          setShowScorePop(true);
          setTimeout(() => setShowScorePop(false), 500);
        }
      }
      // Mushroom hit
      for (const m of mushrooms) {
        if (
          m.alive &&
          b.x < m.x + MUSHROOM_SIZE &&
          b.x + BULLET_SIZE > m.x &&
          b.y < m.y + MUSHROOM_SIZE &&
          b.y + BULLET_SIZE > m.y
        ) {
          m.alive = false;
          b.y = -1000;
          setScore(s => s + 10);
          if (!muted && !isMuted()) playSound('button');
        }
      }
    }
    setBullets(newBullets);
    setSegments(newSegments);
    setMushrooms([...mushrooms]);
    // Win
    if (newSegments.every(s => !s.alive)) {
      setWin(true);
      setRunning(false);
      setScore(s => s + 1000);
      setShowGameOverEffect(true);
      if (!muted && !isMuted()) playSound('bonus');
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
    // Mushrooms
    for (const m of mushrooms) {
      if (!m.alive) continue;
      ctx.save();
      ctx.translate(m.x + MUSHROOM_SIZE / 2, m.y + MUSHROOM_SIZE / 2);
      ctx.fillStyle = '#a52a2a';
      ctx.beginPath();
      ctx.arc(0, 0, MUSHROOM_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('🍄', -10, 7);
      ctx.restore();
    }
    // Centipede
    for (const s of segments) {
      if (!s.alive) continue;
      ctx.save();
      ctx.translate(s.x + CENTIPEDE_SEGMENT / 2, s.y + CENTIPEDE_SEGMENT / 2);
      ctx.shadowColor = '#0f0';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#0f0';
      ctx.beginPath();
      ctx.arc(0, 0, CENTIPEDE_SEGMENT / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('🐛', -10, 7);
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
    ctx.fillText('🕹️', -12, 8);
    ctx.restore();
    // Bullets
    for (const b of bullets) {
      ctx.fillStyle = '#ff0';
      ctx.fillRect(b.x, b.y, BULLET_SIZE, BULLET_SIZE);
    }
    // Score
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.save();
  if (showScorePop) ctx.shadowColor = '#ffe259', ctx.shadowBlur = 16;
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.restore();
    if (showInstructions) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(30, 120, 340, 120);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Centipede (Mini)', 120, 150);
      ctx.font = '14px sans-serif';
      ctx.fillText('Arrow keys: Move', 80, 180);
      ctx.fillText('Space: Fire', 80, 200);
      ctx.fillText('Destroy the centipede!', 80, 220);
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
    setPlayerY(GAME_HEIGHT - 40);
    setBullets([]);
    setScore(0);
    setGameOver(false);
    setWin(false);
    setRunning(true);
    setShowInstructions(true);
    setShowGameOverEffect(false);
    if (!muted && !isMuted()) playSound('button');
    setSegments(() => {
      const arr: Segment[] = [];
      for (let i = 0; i < CENTIPEDE_LENGTH; ++i) {
        arr.push({
          x: 40 + i * (CENTIPEDE_SEGMENT + 2),
          y: 40,
          vx: 1.2,
          vy: 0,
          alive: true,
        });
      }
      return arr;
    });
    setMushrooms(MUSHROOMS.map(m => ({ ...m })));
  }

  async function handleSubmitScore() {
    setSubmitting(true);
    try {
      const id = userId || localStorage.getItem('userId') || 'anon';
      await submitScoreSupabase('centipede', id, score);
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
      <h2 style={{ color: '#fd79a8', textShadow: '0 0 8px #fff', marginBottom: 8, zIndex: 2, position: 'relative' }}>Centipede</h2>
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
        <LeaderboardMini gameId="centipede" />
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

export default Centipede;
