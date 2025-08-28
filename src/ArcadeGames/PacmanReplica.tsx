import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import eatDotSfx from '../assets/eat-pill.mp3';
import eatPowerSfx from '../assets/eat-fruit.mp3';
import eatGhostSfx from '../assets/eat-ghost.mp3';
import extraLifeSfx from '../assets/extra-life.mp3';
import gameOverSfx from '../assets/ending.mp3';
import insertCoinSfx from '../assets/insert-coin.mp3';
import readySfx from '../assets/ready.mp3';
import ghostChaseSfx from '../assets/ghost_chase.wav';
import ghostDeadSfx from '../assets/ghost_dead.wav';
import pacmanEatSfx from '../assets/pacman_eat.wav';
import bgmSfx from '../assets/bgmusic.mp3';

const SFX = {
  eatDot: eatDotSfx,
  eatPower: eatPowerSfx,
  eatGhost: eatGhostSfx,
  extraLife: extraLifeSfx,
  gameOver: gameOverSfx,
  insertCoin: insertCoinSfx,
  ready: readySfx,
  ghostChase: ghostChaseSfx,
  ghostDead: ghostDeadSfx,
  pacmanEat: pacmanEatSfx,
  bgm: bgmSfx,
};
import './GameStyles.css';
import spritesheet from '../assets/arcade_pacman_sprites-2.png';

// --- Pac-Man Replica: Maze, Sprites, and Movement Scaffold ---
// This is a foundation for a true Pac-Man replica. You must add sprites, sounds, and full AI for a complete game.

// Maze legend: 0=empty, 1=wall, 2=dot, 3=power pellet
const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
  [1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1],
  [1,2,1,2,2,2,1,2,2,2,2,2,1,2,2,2,1,2,1],
  [1,2,1,1,1,2,1,1,1,0,1,1,1,2,1,1,1,2,1],
  [1,2,2,2,1,2,2,2,1,2,1,2,2,2,1,2,2,2,1],
  [1,1,1,2,1,1,1,2,1,2,1,2,1,1,1,2,1,1,1],
  [0,0,1,2,2,2,2,2,0,0,0,2,2,2,2,2,1,0,0],
  [1,1,1,2,1,1,1,0,1,1,1,0,1,1,1,2,1,1,1],
  [1,2,2,2,1,2,2,2,1,2,1,2,2,2,1,2,2,2,1],
  [1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,3,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
const ROWS = MAZE.length;
const COLS = MAZE[0].length;

const DIRS = {
  ArrowUp: { dx: 0, dy: -1 },
  ArrowDown: { dx: 0, dy: 1 },
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
};

const initialPacman = { x: 9, y: 11, dir: 'ArrowLeft' as keyof typeof DIRS };
const initialGhosts = [
  { name: 'Blinky', x: 9, y: 5, state: 'normal' },
  { name: 'Pinky', x: 8, y: 7, state: 'normal' },
  { name: 'Inky', x: 10, y: 7, state: 'normal' },
  { name: 'Clyde', x: 9, y: 7, state: 'normal' },
];

import { submitScoreSupabase } from './leaderboardSupabase';

interface PacmanReplicaProps {
  userId?: string;
}

export const PacmanReplica: React.FC<PacmanReplicaProps> = ({ userId }) => {
  // All state, refs, and hooks must be inside the component
  // --- State and refs ---
  const [pacman, setPacman] = useState(initialPacman);
  const [ghosts, setGhosts] = useState(initialGhosts);
  const [maze, setMaze] = useState(MAZE.map(row => [...row]));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('pacman_highscore')) || 0);
  const [fps, setFps] = useState(60);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRefs = {
    eatDot: useRef<HTMLAudioElement>(null),
    eatPower: useRef<HTMLAudioElement>(null),
    eatGhost: useRef<HTMLAudioElement>(null),
    extraLife: useRef<HTMLAudioElement>(null),
    gameOver: useRef<HTMLAudioElement>(null),
    insertCoin: useRef<HTMLAudioElement>(null),
    ready: useRef<HTMLAudioElement>(null),
    ghostChase: useRef<HTMLAudioElement>(null),
    ghostDead: useRef<HTMLAudioElement>(null),
    pacmanEat: useRef<HTMLAudioElement>(null),
    bgm: useRef<HTMLAudioElement>(null),
  };

  // --- Game logic and effects ---
  useEffect(() => {
    if (containerRef.current) containerRef.current.focus();
  }, []);

  // FPS counter
  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let running = true;
    function loop() {
      frames++;
      const now = performance.now();
      if (now - last > 1000) {
        setFps(frames);
        frames = 0;
        last = now;
      }
      if (running) requestAnimationFrame(loop);
    }
    loop();
    return () => { running = false; };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (paused || gameOver) return;
      if (e.key in DIRS) {
        setPacman(p => ({ ...p, dir: e.key as keyof typeof DIRS }));
      } else if (e.key === ' ' || e.key === 'p') {
        setPaused(paused => !paused);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [paused, gameOver]);

  // Pac-Man movement and eating
  useEffect(() => {
    if (paused || gameOver) return;
    const interval = setInterval(() => {
      setPacman(p => {
        const { dx, dy } = DIRS[p.dir];
        let nx = p.x + dx, ny = p.y + dy;
        if (maze[ny] && maze[ny][nx] !== 1) {
          // Eat dot or pellet
          setMaze(mz => {
            const cell = mz[ny][nx];
            if (cell === 2 || cell === 3) {
              if (cell === 2 && audioRefs.eatDot.current) audioRefs.eatDot.current.currentTime = 0, audioRefs.eatDot.current.play();
              if (cell === 3 && audioRefs.eatPower.current) audioRefs.eatPower.current.currentTime = 0, audioRefs.eatPower.current.play();
              setScore(s => s + (cell === 2 ? 10 : 50));
              const newMz = mz.map(row => [...row]);
              newMz[ny][nx] = 0;
              // Win if no dots or pellets left
              if (newMz.flat().every(c => c !== 2 && c !== 3)) {
                setWin(true);
                setGameOver(true);
                if (audioRefs.extraLife.current) audioRefs.extraLife.current.currentTime = 0, audioRefs.extraLife.current.play();
              }
              return newMz;
            }
            return mz;
          });
          return { ...p, x: nx, y: ny };
        }
        return p;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [maze, paused, gameOver]);

  // Ghost movement (simple random for demo)
  useEffect(() => {
    if (paused || gameOver) return;
    const interval = setInterval(() => {
      setGhosts(gs => gs.map(g => {
        const moves = Object.values(DIRS)
          .map(({ dx, dy }) => ({ x: g.x + dx, y: g.y + dy }))
          .filter(({ x, y }) => maze[y] && maze[y][x] !== 1);
        const move = moves[Math.floor(Math.random() * moves.length)] || { x: g.x, y: g.y };
        return { ...g, ...move };
      }));
    }, 300);
    return () => clearInterval(interval);
  }, [maze, paused, gameOver]);

  // Collision detection
  useEffect(() => {
    if (gameOver) return;
    ghosts.forEach(g => {
      if (g.x === pacman.x && g.y === pacman.y) {
        setGameOver(true);
        setShake(true);
        if (audioRefs.gameOver.current) audioRefs.gameOver.current.currentTime = 0, audioRefs.gameOver.current.play();
        setTimeout(() => setShake(false), 350);
      }
    });
  }, [ghosts, pacman, gameOver]);

  // High score and autosave
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('pacman_highscore', String(score));
    }
  }, [score, highScore]);

  // Auto-save score to Supabase leaderboard on game over if new high score
  useEffect(() => {
    if (gameOver && win && userId && score >= highScore) {
      submitScoreSupabase('Pacman', userId, score);
    }
  }, [gameOver, win, userId, score, highScore]);

  // Reset on game over
  useEffect(() => {
    if (gameOver) {
      const t = setTimeout(() => {
        setPacman(initialPacman);
        setGhosts(initialGhosts);
        setMaze(MAZE.map(row => [...row]));
        setScore(0);
        setGameOver(false);
        setWin(false);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [gameOver]);

  // --- Canvas rendering ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Sprite sizes (px)
  const TILE = 24;
  const PACMAN_SIZE = 24;
  const GHOST_SIZE = 24;

  // Sprite sheet coordinates (example, adjust as needed for your sheet)
  const SPRITES = {
    wall: { x: 0, y: 0, w: 24, h: 24 },
    dot: { x: 24, y: 0, w: 24, h: 24 },
    pellet: { x: 48, y: 0, w: 24, h: 24 },
    pacman: { x: 0, y: 24, w: 24, h: 24 },
    blinky: { x: 24, y: 24, w: 24, h: 24 },
    pinky: { x: 48, y: 24, w: 24, h: 24 },
    inky: { x: 72, y: 24, w: 24, h: 24 },
    clyde: { x: 96, y: 24, w: 24, h: 24 },
  };

  // Cache the loaded image for smooth rendering
  const [spriteImg, setSpriteImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new window.Image();
    img.src = spritesheet;
    img.onload = () => setSpriteImg(img);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spriteImg) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Draw background
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, COLS * TILE, ROWS * TILE);
    // Draw maze
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = maze[y][x];
        if (cell === 1) ctx.drawImage(spriteImg, SPRITES.wall.x, SPRITES.wall.y, SPRITES.wall.w, SPRITES.wall.h, x * TILE, y * TILE, TILE, TILE);
        if (cell === 2) ctx.drawImage(spriteImg, SPRITES.dot.x, SPRITES.dot.y, SPRITES.dot.w, SPRITES.dot.h, x * TILE + 8, y * TILE + 8, 8, 8);
        if (cell === 3) ctx.drawImage(spriteImg, SPRITES.pellet.x, SPRITES.pellet.y, SPRITES.pellet.w, SPRITES.pellet.h, x * TILE + 4, y * TILE + 4, 16, 16);
      }
    }
    // Draw ghosts
    ghosts.forEach(g => {
      let sprite = SPRITES.blinky;
      if (g.name === 'Pinky') sprite = SPRITES.pinky;
      if (g.name === 'Inky') sprite = SPRITES.inky;
      if (g.name === 'Clyde') sprite = SPRITES.clyde;
      ctx.drawImage(spriteImg, sprite.x, sprite.y, sprite.w, sprite.h, g.x * TILE, g.y * TILE, GHOST_SIZE, GHOST_SIZE);
    });
    // Draw Pac-Man
    ctx.drawImage(spriteImg, SPRITES.pacman.x, SPRITES.pacman.y, SPRITES.pacman.w, SPRITES.pacman.h, pacman.x * TILE, pacman.y * TILE, PACMAN_SIZE, PACMAN_SIZE);
  }, [maze, ghosts, pacman, spriteImg]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      aria-label="Pac-Man Arcade Game"
      style={{ position: 'relative', width: COLS * 24, margin: '0 auto', outline: 'none' }}
    >
      <button
        className="arcade-music-btn"
        onClick={() => setMusicOn(m => !m)}
        title={musicOn ? 'Mute music' : 'Unmute music'}
        aria-label={musicOn ? 'Mute music' : 'Unmute music'}
      >
        {musicOn ? '🔊 Music' : '🔇 Music'}
      </button>
      <button
        className="arcade-music-btn"
        style={{ right: 120, top: 8, position: 'absolute' }}
        onClick={() => setPaused(p => !p)}
        aria-label={paused ? 'Resume' : 'Pause'}
      >
        {paused ? '▶️ Resume' : '⏸️ Pause'}
      </button>
      <div
        className={
          'arcade-glow arcade-fadein' +
          (shake ? ' arcade-shake' : '') +
          (flash ? ' arcade-flash' : '')
        }
        style={{
          position: 'relative',
          background: '#222',
          border: '2px solid #ffe600',
          borderRadius: 10,
          overflow: 'hidden',
          filter: paused ? 'grayscale(0.7) blur(2px)' : undefined,
        }}
        aria-live="polite"
      >
        <canvas
          ref={canvasRef}
          width={COLS * TILE}
          height={ROWS * TILE}
          style={{ display: 'block', width: COLS * TILE, height: ROWS * TILE, background: 'transparent' }}
        />
        <div className="arcade-scanlines" />
        {paused && (
          <div style={{
            position: 'absolute',
            left: 0, top: 0, right: 0, bottom: 0,
            background: '#000a',
            color: '#ffe600',
            fontSize: 32,
            fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
            textShadow: '0 0 18px #fff, 0 0 24px #ffe600',
          }}>
            PAUSED
          </div>
        )}
      </div>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: '10px 0 2px', textAlign: 'center' }}>
        Score: {score} &nbsp; | &nbsp; High Score: {highScore} &nbsp; | &nbsp; <span style={{ color: '#ffe600' }}>FPS: {fps}</span>
      </div>
      {/* Touch controls for mobile, with swipe support */}
      <div
        style={{ display: 'flex', justifyContent: 'center', margin: 8, gap: 8 }}
        onTouchStart={e => {
          const touch = e.touches[0];
          (window as any)._touchStart = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={e => {
          const touch = e.changedTouches[0];
          const start = (window as any)._touchStart;
          if (!start) return;
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 20) setPacman(p => ({ ...p, dir: 'ArrowRight' }));
            else if (dx < -20) setPacman(p => ({ ...p, dir: 'ArrowLeft' }));
          } else {
            if (dy > 20) setPacman(p => ({ ...p, dir: 'ArrowDown' }));
            else if (dy < -20) setPacman(p => ({ ...p, dir: 'ArrowUp' }));
          }
        }}
      >
        <button aria-label="Up" onClick={() => setPacman(p => ({ ...p, dir: 'ArrowUp' }))}>⬆️</button>
        <button aria-label="Left" onClick={() => setPacman(p => ({ ...p, dir: 'ArrowLeft' }))}>⬅️</button>
        <button aria-label="Down" onClick={() => setPacman(p => ({ ...p, dir: 'ArrowDown' }))}>⬇️</button>
        <button aria-label="Right" onClick={() => setPacman(p => ({ ...p, dir: 'ArrowRight' }))}>➡️</button>
      </div>
      {gameOver && (
        <div style={{
          color: win ? '#ffe600' : '#f00',
          fontWeight: 900,
          fontSize: 28,
          marginTop: 10,
          textShadow: '0 0 18px #fff, 0 0 24px #ffe600',
          zIndex: 3,
          position: 'relative',
        }}>
          {win ? '🏆 YOU WIN!' : '💀 GAME OVER'}
        </div>
      )}
      {/* Audio elements for SFX and music */}
      {Object.entries(SFX).map(([key, src]) => (
        <audio
          key={key}
          ref={audioRefs[key as keyof typeof audioRefs]}
          src={src}
          preload="auto"
          loop={key === 'bgm'}
        />
      ))}
    </div>
  );
};









