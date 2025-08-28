import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import './GameStyles.css';
import { submitScoreSupabase } from './leaderboardSupabase';
import { playSound, isMuted } from '../soundManager';

// Lightweight Asteroids mini-game
const WIDTH = 200, HEIGHT = 200;
const ASTEROID_COUNT = 5;

function randomAsteroid() {
  return {
    x: Math.random() * WIDTH,
    y: Math.random() * HEIGHT,
    dx: (Math.random() - 0.5) * 2,
    dy: (Math.random() - 0.5) * 2,
    r: 10 + Math.random() * 10,
  };
}


interface TelegramWebApp {
  initDataUnsafe?: {
    user?: {
      id?: string | number;
    };
  };
}

const Asteroids: React.FC<{ userid?: string; muted?: boolean }> = ({ userid: propUserId = '', muted = false }) => {
  // Telegram userId auto-detect
  const [userId, setUserId] = useState<string>(propUserId || '');
  useEffect(() => {
    if (!propUserId) {
      try {
        const tg = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
        if (tg && tg.initDataUnsafe?.user?.id) {
          setUserId(tg.initDataUnsafe.user.id.toString());
        }
      } catch (e) {
        // Ignore Telegram detection errors
      }
    }
  }, [propUserId]);

  const [ship, setShip] = useState(() => {
    const stored = localStorage.getItem('asteroids_ship');
    return stored ? JSON.parse(stored) : { x: WIDTH / 2, y: HEIGHT / 2, angle: 0 };
  });
  const [asteroids, setAsteroids] = useState(() => {
    const stored = localStorage.getItem('asteroids_asteroids');
    return stored ? JSON.parse(stored) : Array.from({ length: ASTEROID_COUNT }, randomAsteroid);
  });
  const [score, setScore] = useState(() => {
    const stored = localStorage.getItem('asteroids_score');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(() => {
    const stored = localStorage.getItem('asteroids_gameOver');
    return stored ? JSON.parse(stored) : false;
  });
  // Auto-save logic
  useEffect(() => {
    localStorage.setItem('asteroids_ship', JSON.stringify(ship));
  }, [ship]);
  useEffect(() => {
    localStorage.setItem('asteroids_asteroids', JSON.stringify(asteroids));
  }, [asteroids]);
  useEffect(() => {
    localStorage.setItem('asteroids_score', score.toString());
  }, [score]);
  useEffect(() => {
    localStorage.setItem('asteroids_gameOver', JSON.stringify(gameOver));
  }, [gameOver]);
  const [showGameOverEffect, setShowGameOverEffect] = useState(false);
  const thrustRef = useRef(false);

  // Auto-restart after game over
  useEffect(() => {
    if (gameOver) {
      setShowGameOverEffect(true);
      if (!muted && !isMuted()) playSound('die');
      const t = setTimeout(() => {
        setShip({ x: WIDTH / 2, y: HEIGHT / 2, angle: 0 });
        setAsteroids(Array.from({ length: ASTEROID_COUNT }, randomAsteroid));
        setScore(0);
        setGameOver(false);
        setShowGameOverEffect(false);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [gameOver, muted]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
  setShip((s: { x: number; y: number; angle: number }) => {
        let { x, y, angle } = s;
        if (e.key === 'ArrowLeft') angle -= 0.2;
        if (e.key === 'ArrowRight') angle += 0.2;
        if (e.key === 'ArrowUp') {
          x += Math.cos(angle) * 5;
          y += Math.sin(angle) * 5;
          thrustRef.current = true;
          if (!muted && !isMuted()) playSound('button');
        } else {
          thrustRef.current = false;
        }
        x = (x + WIDTH) % WIDTH;
        y = (y + HEIGHT) % HEIGHT;
        return { x, y, angle };
      });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver, muted]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setAsteroids((as: any[]) =>
        as.map((a: any) => ({
          ...a,
          x: (a.x + a.dx + WIDTH) % WIDTH,
          y: (a.y + a.dy + HEIGHT) % HEIGHT,
        }))
      );
      // Collision
  asteroids.forEach((a: any) => {
        const dist = Math.hypot(a.x - ship.x, a.y - ship.y);
        if (dist < a.r + 5) {
          setGameOver(true);
        }
      });
    }, 50);
    return () => clearInterval(interval);
  }, [ship, asteroids, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    setScore((s) => s + 1);
  }, [asteroids, gameOver]);

  // Submit score to Supabase leaderboard on game over
  useEffect(() => {
    if (gameOver && score > 0 && userId) {
      submitScoreSupabase('Asteroids', userId, score);
    }
  }, [gameOver, score, userId]);

  // Animated starfield background
  const starCount = 32;
  const stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * WIDTH,
    y: Math.random() * HEIGHT,
    r: 0.7 + Math.random() * 1.2,
    opacity: 0.2 + Math.random() * 0.5,
  }));

  return (
    <div
      className="arcade-game"
      style={{
        background: 'radial-gradient(ellipse at 60% 40%, #18182a 70%, #23234a 100%)',
        borderRadius: 18,
        boxShadow: '0 0 32px #ffe600',
        padding: 24,
        maxWidth: 340,
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated starfield */}
      <svg width={WIDTH} height={HEIGHT} style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }}>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.opacity} />
        ))}
      </svg>
      <h4 style={{ color: '#ffe600', textShadow: '0 0 8px #fff', marginBottom: 8, zIndex: 2, position: 'relative' }}>Asteroids</h4>
      <svg width={WIDTH} height={HEIGHT} style={{ background: 'transparent', zIndex: 2, position: 'relative', borderRadius: 10, boxShadow: '0 0 12px #ffe600 inset' }}>
        <circle cx={ship.x} cy={ship.y} r={7} fill="yellow" stroke="#fff" strokeWidth={2} />
  {asteroids.map((a: any, i: number) => (
          <circle key={i} cx={a.x} cy={a.y} r={a.r} fill="#888" stroke="#fff" strokeWidth={1.5} />
        ))}
      </svg>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: '10px 0 2px', textShadow: '0 0 8px #ffe600' }}>Score: {score}</div>
      {gameOver && (
        <div
          style={{
            color: '#ffe600',
            fontWeight: 900,
            fontSize: 28,
            marginTop: 10,
            textShadow: '0 0 18px #fff, 0 0 24px #ffe600',
            animation: showGameOverEffect ? 'popError 1.1s' : undefined,
            zIndex: 3,
            position: 'relative',
          }}
        >
          💥 GAME OVER
        </div>
      )}
  {/* Removed unused userId display for consistency */}
      <style>{`
        @keyframes popError {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Asteroids;
