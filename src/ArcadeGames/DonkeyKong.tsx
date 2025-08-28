import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import { submitScoreSupabase } from './leaderboardSupabase';
import { playSound, isMuted } from '../soundManager';

// Game constants
const GAME_WIDTH = 400;
const GAME_HEIGHT = 480;
const PLAYER_WIDTH = 24;
const PLAYER_HEIGHT = 24;
const BARREL_SIZE = 20;
const PLATFORM_HEIGHT = 12;
const LADDER_WIDTH = 16;
const GRAVITY = 0.7;
const JUMP_VELOCITY = -10;
const PLAYER_SPEED = 3.2;
const BARREL_SPEED = 2.2;
const LEVELS = [
  // y, left, right, hasLadderUp, hasLadderDown
  { y: 420, left: 20, right: 380, ladders: [60, 200, 340] },
  { y: 340, left: 40, right: 360, ladders: [120, 300] },
  { y: 260, left: 20, right: 380, ladders: [60, 200, 340] },
  { y: 180, left: 40, right: 360, ladders: [120, 300] },
  { y: 100, left: 20, right: 380, ladders: [200] }, // top platform
];
const PRINCESS_X = 200;
const PRINCESS_Y = 80;

type Rect = { x: number; y: number; w: number; h: number };

function rectsOverlap(a: Rect, b: Rect) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

interface DonkeyKongProps {
  userid?: string;
  muted?: boolean;
}
const DonkeyKong: React.FC<DonkeyKongProps> = ({ userid: propUserId, muted }) => {
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
  const [score, setScore] = useState(() => {
    const stored = localStorage.getItem('dk_score');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(() => {
    const stored = localStorage.getItem('dk_gameOver');
    return stored ? JSON.parse(stored) : false;
  });
  const [win, setWin] = useState(() => {
    const stored = localStorage.getItem('dk_win');
    return stored ? JSON.parse(stored) : false;
  });
  const [running, setRunning] = useState(() => {
    const stored = localStorage.getItem('dk_running');
    return stored ? JSON.parse(stored) : true;
  });
  const [showInstructions, setShowInstructions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Player state
  const [player, setPlayer] = useState(() => {
    const stored = localStorage.getItem('dk_player');
    return stored ? JSON.parse(stored) : {
      x: 40,
      y: LEVELS[0].y - PLAYER_HEIGHT,
      vx: 0,
      vy: 0,
      onGround: true,
      climbing: false,
      dir: 1,
      lives: 3,
    };
  });
  // Barrel type
  type Barrel = { x: number; y: number; vx: number; vy: number; remove?: boolean };
  // Barrels
  const [barrels, setBarrels] = useState<Barrel[]>(() => {
    const stored = localStorage.getItem('dk_barrels');
    return stored ? JSON.parse(stored) : [];
  });
  // Auto-save logic
  useEffect(() => {
    localStorage.setItem('dk_player', JSON.stringify(player));
  }, [player]);
  useEffect(() => {
    localStorage.setItem('dk_barrels', JSON.stringify(barrels));
  }, [barrels]);
  useEffect(() => {
    localStorage.setItem('dk_score', score.toString());
  }, [score]);
  useEffect(() => {
    localStorage.setItem('dk_gameOver', JSON.stringify(gameOver));
  }, [gameOver]);
  useEffect(() => {
    localStorage.setItem('dk_win', JSON.stringify(win));
  }, [win]);
  useEffect(() => {
    localStorage.setItem('dk_running', JSON.stringify(running));
  }, [running]);
  // Key state
  const keys = useRef<{ [k: string]: boolean }>({});
  // Barrel spawn timer
  const barrelTimer = useRef(0);

  // Handle keyboard
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
  }, [running, player, barrels, gameOver, win]);

  // Game update logic
  const [showGameOverEffect, setShowGameOverEffect] = useState(false);
  const [showScorePop, setShowScorePop] = useState(false);

  function update(dt: number) {
    if (gameOver || win) return;
    const p = { ...player };
    // Movement
    if (!p.climbing) {
      if (keys.current['ArrowLeft']) {
        p.vx = -PLAYER_SPEED;
        p.dir = -1;
      } else if (keys.current['ArrowRight']) {
        p.vx = PLAYER_SPEED;
        p.dir = 1;
      } else {
        p.vx = 0;
      }
    }
    // Jump
    if (keys.current[' '] && p.onGround && !p.climbing) {
      p.vy = JUMP_VELOCITY;
      p.onGround = false;
      if (!muted && !isMuted()) playSound('spin');
    }
    // Ladders
    let onLadder = false;
    let ladderX = 0;
    for (let i = 0; i < LEVELS.length; ++i) {
      const plat = LEVELS[i];
      for (const lx of plat.ladders) {
        if (
          Math.abs(p.x + PLAYER_WIDTH / 2 - lx) < LADDER_WIDTH &&
          Math.abs(p.y + PLAYER_HEIGHT - plat.y) < 32
        ) {
          onLadder = true;
          ladderX = lx;
        }
      }
    }
    if (onLadder && (keys.current['ArrowUp'] || keys.current['ArrowDown'])) {
      p.climbing = true;
      p.vx = 0;
      if (keys.current['ArrowUp']) p.vy = -PLAYER_SPEED;
      else if (keys.current['ArrowDown']) p.vy = PLAYER_SPEED;
      else p.vy = 0;
      // Snap to ladder
      p.x = ladderX - PLAYER_WIDTH / 2;
    } else if (!onLadder) {
      p.climbing = false;
    }
    // Gravity
    if (!p.climbing) {
      p.vy += GRAVITY * dt;
    }
    // Move
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    // Clamp
    p.x = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, p.x));
    // Platforms
    let onPlat = false;
    for (const plat of LEVELS) {
      if (
        p.y + PLAYER_HEIGHT >= plat.y &&
        p.y + PLAYER_HEIGHT <= plat.y + PLATFORM_HEIGHT + 4 &&
        p.x + PLAYER_WIDTH > plat.left &&
        p.x < plat.right
      ) {
        onPlat = true;
        p.y = plat.y - PLAYER_HEIGHT;
        p.vy = 0;
        p.onGround = true;
        break;
      }
    }
    if (!onPlat && !p.climbing) {
      p.onGround = false;
    }
    // Win condition
    if (
      Math.abs(p.x + PLAYER_WIDTH / 2 - PRINCESS_X) < 24 &&
      Math.abs(p.y - PRINCESS_Y) < 24
    ) {
      setWin(true);
      setScore((s) => s + 1000);
      setRunning(false);
      setShowGameOverEffect(true);
      if (!muted && !isMuted()) playSound('bonus');
      setTimeout(() => setShowGameOverEffect(false), 1200);
      return;
    }
    // Barrels
    let newBarrels = barrels.map((b) => ({ ...b }));
    for (const b of newBarrels) {
      b.x += b.vx * dt;
      // Barrel falls to next platform
      for (let i = 0; i < LEVELS.length; ++i) {
        const plat = LEVELS[i];
        if (
          b.y + BARREL_SIZE >= plat.y &&
          b.y + BARREL_SIZE <= plat.y + PLATFORM_HEIGHT + 4 &&
          b.x + BARREL_SIZE > plat.left &&
          b.x < plat.right
        ) {
          b.y = plat.y - BARREL_SIZE;
          b.vy = 0;
          // At edge, drop to next
          if (b.x <= plat.left || b.x + BARREL_SIZE >= plat.right) {
            b.vy = 4;
          }
        }
      }
      b.y += b.vy * dt;
      // Remove if off screen
      if (b.y > GAME_HEIGHT) b.remove = true;
      // Collision with player
      if (
        rectsOverlap(
          { x: b.x, y: b.y, w: BARREL_SIZE, h: BARREL_SIZE },
          { x: p.x, y: p.y, w: PLAYER_WIDTH, h: PLAYER_HEIGHT }
        )
      ) {
        setScore((s) => Math.max(0, s - 100));
        setPlayer((pl: { lives: number; }) => ({ ...pl, lives: pl.lives - 1 }));
        setGameOver(true);
        setRunning(false);
        setShowGameOverEffect(true);
        if (!muted && !isMuted()) playSound('die');
        setTimeout(() => setShowGameOverEffect(false), 1200);
        return;
      }
    }
    newBarrels = newBarrels.filter((b) => !b.remove);
    // Barrel spawn
    barrelTimer.current += 1 * dt;
    if (barrelTimer.current > 60) {
      newBarrels.push({ x: 40, y: 80, vx: BARREL_SPEED, vy: 0 });
      barrelTimer.current = 0;
    }
    setBarrels(newBarrels);
    setPlayer(p);
  setScore((s) => s + 1);
  setShowScorePop(true);
  setTimeout(() => setShowScorePop(false), 300);
  }

  // Drawing
  function draw() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Background
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Platforms
    for (const plat of LEVELS) {
      ctx.fillStyle = '#a0522d';
      ctx.fillRect(plat.left, plat.y, plat.right - plat.left, PLATFORM_HEIGHT);
      // Ladders
      for (const lx of plat.ladders) {
        ctx.fillStyle = '#8ecae6';
        ctx.fillRect(lx - LADDER_WIDTH / 2, plat.y - 40, LADDER_WIDTH, 40);
      }
    }
    // Princess
    ctx.fillStyle = '#ffb6c1';
    ctx.beginPath();
    ctx.arc(PRINCESS_X, PRINCESS_Y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('👸', PRINCESS_X - 10, PRINCESS_Y + 6);
    // Barrels
    for (const b of barrels) {
      ctx.fillStyle = '#b5651d';
      ctx.beginPath();
      ctx.arc(b.x + BARREL_SIZE / 2, b.y + BARREL_SIZE / 2, BARREL_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    }
    // Player
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('🧑‍🔧', player.x + 1, player.y + 20);
    // Score/lives
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.save();
  if (showScorePop) ctx.shadowColor = '#ffe259', ctx.shadowBlur = 16;
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.restore();
  ctx.fillText(`Lives: ${player.lives}`, 300, 20);
    if (showInstructions) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(30, 120, 340, 120);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Donkey Kong (Mini)', 110, 150);
      ctx.font = '14px sans-serif';
      ctx.fillText('Arrow keys: Move/jump/climb', 80, 180);
      ctx.fillText('Space: Jump', 80, 200);
      ctx.fillText('Reach the princess, avoid barrels!', 80, 220);
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

  // Restart
  function restart() {
    setPlayer({ x: 40, y: LEVELS[0].y - PLAYER_HEIGHT, vx: 0, vy: 0, onGround: true, climbing: false, dir: 1, lives: 3 });
    setBarrels([]);
    setScore(0);
    setGameOver(false);
    setWin(false);
    setRunning(true);
    setShowInstructions(true);
    setShowGameOverEffect(false);
    if (!muted && !isMuted()) playSound('button');
  }

  // Submit score
  async function handleSubmitScore() {
    setSubmitting(true);
    try {
      const id = userId || localStorage.getItem('userId') || 'anon';
      await submitScoreSupabase('donkey_kong', id, score);
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
      <h2 style={{ color: '#fd79a8', textShadow: '0 0 8px #fff', marginBottom: 8, zIndex: 2, position: 'relative' }}>Donkey Kong</h2>
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
            onTouchStart={restart}
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
            onTouchStart={handleSubmitScore}
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
        <LeaderboardMini gameId="donkey_kong" />
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

export default DonkeyKong;
