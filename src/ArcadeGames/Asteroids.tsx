import React, { useEffect, useState } from 'react';
import './GameStyles.css';
import { submitScoreSupabase } from './leaderboardSupabase';

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

const Asteroids: React.FC<{ userid?: string }> = ({ userid }) => {
  const [ship, setShip] = useState({ x: WIDTH / 2, y: HEIGHT / 2, angle: 0 });
  const [asteroids, setAsteroids] = useState(Array.from({ length: ASTEROID_COUNT }, randomAsteroid));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Auto-restart after game over
  useEffect(() => {
    if (gameOver) {
      const t = setTimeout(() => {
        setShip({ x: WIDTH / 2, y: HEIGHT / 2, angle: 0 });
        setAsteroids(Array.from({ length: ASTEROID_COUNT }, randomAsteroid));
        setScore(0);
        setGameOver(false);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [gameOver]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      setShip((s) => {
        let { x, y, angle } = s;
        if (e.key === 'ArrowLeft') angle -= 0.2;
        if (e.key === 'ArrowRight') angle += 0.2;
        if (e.key === 'ArrowUp') {
          x += Math.cos(angle) * 5;
          y += Math.sin(angle) * 5;
        }
        x = (x + WIDTH) % WIDTH;
        y = (y + HEIGHT) % HEIGHT;
        return { x, y, angle };
      });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setAsteroids((as) =>
        as.map((a) => ({
          ...a,
          x: (a.x + a.dx + WIDTH) % WIDTH,
          y: (a.y + a.dy + HEIGHT) % HEIGHT,
        }))
      );
      // Collision
      asteroids.forEach((a) => {
        const dist = Math.hypot(a.x - ship.x, a.y - ship.y);
        if (dist < a.r + 5) setGameOver(true);
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
    if (gameOver && score > 0 && userid) {
      submitScoreSupabase('Asteroids', userid, score);
    }
  }, [gameOver, score, userid]);

  return (
    <div className="arcade-game">
      <h4>Asteroids</h4>
      <svg width={WIDTH} height={HEIGHT} style={{ background: '#111' }}>
        <circle cx={ship.x} cy={ship.y} r={5} fill="yellow" />
        {asteroids.map((a, i) => (
          <circle key={i} cx={a.x} cy={a.y} r={a.r} fill="gray" />
        ))}
      </svg>
      <div>Score: {score}</div>
      {gameOver && <div>Game Over</div>}
    </div>
  );
};

export default Asteroids;
