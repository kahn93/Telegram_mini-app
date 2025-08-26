
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import styles from '../App.module.scss';
import { playSound, isMuted } from '../soundManager';
import { submitScoreSupabase } from '../ArcadeGames/leaderboardSupabase';

const WIDTH = 240;
const HEIGHT = 340;
const SOUL_RADIUS = 12;
const ANGEL_WIDTH = 38;
const ANGEL_HEIGHT = 32;
const OBSTACLE_RADIUS = 14;
const BONUS_RADIUS = 10;

function randomX() {
  return 20 + Math.random() * (WIDTH - 40);
}

type Soul = { x: number; y: number; speed: number };
type Obstacle = { x: number; y: number; speed: number };
type Bonus = { x: number; y: number; speed: number };

const GuardianAngel: React.FC<{ userId?: string }> = ({ userId: propUserId }) => {
  // User ID auto-detect (Telegram)
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

  // Game state
  const [angelX, setAngelX] = useState(WIDTH / 2);
  const [souls, setSouls] = useState<Soul[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOverEffect, setShowGameOverEffect] = useState(false);
  const [showScorePop, setShowScorePop] = useState(false);
  const [highScore, setHighScore] = useState<number | null>(null);
  const gameRef = useRef<HTMLDivElement>(null);

  // Load high score from localStorage
  useEffect(() => {
    const hs = localStorage.getItem('guardianAngelHighScore');
    if (hs) setHighScore(Number(hs));
  }, []);

  // Handle keyboard and touch controls
  useEffect(() => {
    if (gameOver) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setAngelX((x) => Math.max(ANGEL_WIDTH / 2, x - 24));
      if (e.key === 'ArrowRight') setAngelX((x) => Math.min(WIDTH - ANGEL_WIDTH / 2, x + 24));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver]);

  // Touch controls for mobile
  useEffect(() => {
    if (gameOver) return;
    const handleTouch = (e: TouchEvent) => {
      if (!gameRef.current) return;
      const rect = gameRef.current.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      setAngelX(Math.max(ANGEL_WIDTH / 2, Math.min(WIDTH - ANGEL_WIDTH / 2, touchX)));
    };
    const div = gameRef.current;
    if (div) div.addEventListener('touchmove', handleTouch);
    return () => { if (div) div.removeEventListener('touchmove', handleTouch); };
  }, [gameOver]);

  // Main game loop
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      // Move souls
      setSouls((prev) => prev.map((s) => ({ ...s, y: s.y + s.speed })));
      // Move obstacles
      setObstacles((prev) => prev.map((o) => ({ ...o, y: o.y + o.speed })));
      // Move bonuses
      setBonuses((prev) => prev.map((b) => ({ ...b, y: b.y + b.speed })));

      // Remove off-screen
      setSouls((prev) => prev.filter((s) => s.y < HEIGHT + SOUL_RADIUS));
      setObstacles((prev) => prev.filter((o) => o.y < HEIGHT + OBSTACLE_RADIUS));
      setBonuses((prev) => prev.filter((b) => b.y < HEIGHT + BONUS_RADIUS));

      // Collision: angel & soul
      setSouls((prev) => {
        let caught = false;
        const next = prev.filter((s) => {
          const dx = Math.abs(s.x - angelX);
          const dy = Math.abs(s.y - (HEIGHT - ANGEL_HEIGHT / 2));
          if (dx < SOUL_RADIUS + ANGEL_WIDTH / 2 - 4 && dy < SOUL_RADIUS + ANGEL_HEIGHT / 2 - 4) {
            caught = true;
            return false;
          }
          return true;
        });
        if (caught) {
          setScore((sc) => sc + 10);
          setShowScorePop(true);
          if (!isMuted()) playSound('win');
          setTimeout(() => setShowScorePop(false), 400);
        }
        return next;
      });

      // Collision: angel & obstacle
      setObstacles((prev) => {
        let hit = false;
        const next = prev.filter((o) => {
          const dx = Math.abs(o.x - angelX);
          const dy = Math.abs(o.y - (HEIGHT - ANGEL_HEIGHT / 2));
          if (dx < OBSTACLE_RADIUS + ANGEL_WIDTH / 2 - 2 && dy < OBSTACLE_RADIUS + ANGEL_HEIGHT / 2 - 2) {
            hit = true;
            return false;
          }
          return true;
        });
        if (hit) {
          setLives((l) => l - 1);
          if (!isMuted()) playSound('die');
        }
        return next;
      });

      // Collision: angel & bonus
      setBonuses((prev) => {
        let got = false;
        const next = prev.filter((b) => {
          const dx = Math.abs(b.x - angelX);
          const dy = Math.abs(b.y - (HEIGHT - ANGEL_HEIGHT / 2));
          if (dx < BONUS_RADIUS + ANGEL_WIDTH / 2 - 2 && dy < BONUS_RADIUS + ANGEL_HEIGHT / 2 - 2) {
            got = true;
            return false;
          }
          return true;
        });
        if (got) {
          setScore((sc) => sc + 30);
          if (!isMuted()) playSound('bonus');
        }
        return next;
      });

      // Missed soul (soul reaches bottom)
      setSouls((prev) => {
        let missed = false;
        const next = prev.filter((s) => {
          if (s.y >= HEIGHT - SOUL_RADIUS) {
            missed = true;
            return false;
          }
          return true;
        });
        if (missed) {
          setLives((l) => l - 1);
          if (!isMuted()) playSound('die');
        }
        return next;
      });

    }, 40);
    return () => clearInterval(interval);
  }, [angelX, gameOver]);

  // Spawning souls, obstacles, bonuses
  useEffect(() => {
    if (gameOver) return;
    const soulInt = setInterval(() => {
      setSouls((prev) => [...prev, { x: randomX(), y: -SOUL_RADIUS, speed: 2.2 + Math.random() * 1.2 }]);
    }, 900);
    const obsInt = setInterval(() => {
      setObstacles((prev) => [...prev, { x: randomX(), y: -OBSTACLE_RADIUS, speed: 2.5 + Math.random() * 1.5 }]);
    }, 1800);
    const bonusInt = setInterval(() => {
      if (Math.random() < 0.5) setBonuses((prev) => [...prev, { x: randomX(), y: -BONUS_RADIUS, speed: 2.1 + Math.random() * 1.1 }]);
    }, 3500);
    return () => { clearInterval(soulInt); clearInterval(obsInt); clearInterval(bonusInt); };
  }, [gameOver]);

  // Game over logic
  useEffect(() => {
    if (lives <= 0 && !gameOver) {
      setGameOver(true);
      setShowGameOverEffect(true);
      if (!isMuted()) playSound('die');
      setTimeout(() => setShowGameOverEffect(false), 1200);
      // Save high score
      if (score > (highScore || 0)) {
        setHighScore(score);
        localStorage.setItem('guardianAngelHighScore', String(score));
      }
      // Submit to Supabase leaderboard
      if (userId && score > 0) submitScoreSupabase('GuardianAngel', userId, score);
    }
  }, [lives, gameOver, score, userId, highScore]);

  // Restart game
  const handleRestart = () => {
    setSouls([]);
    setObstacles([]);
    setBonuses([]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setShowGameOverEffect(false);
    setAngelX(WIDTH / 2);
  };

  // Render
  return (
    <div className={styles.arcadeGame} style={{ padding: 12, textAlign: 'center', maxWidth: 340, margin: '0 auto' }}>
      <h2 style={{ color: '#6ec6ff', textShadow: '0 0 8px #fff', marginBottom: 8 }}>👼 Guardian Angel</h2>
      <div ref={gameRef} style={{ position: 'relative', width: WIDTH, height: HEIGHT, margin: '0 auto', background: 'radial-gradient(ellipse at 60% 40%, #23234a 70%, #18182a 100%)', borderRadius: 18, boxShadow: '0 0 32px #6ec6ff', overflow: 'hidden', border: '2px solid #6ec6ff' }}>
        {/* Souls */}
        {souls.map((s, i) => (
          <div key={i} style={{ position: 'absolute', left: s.x - SOUL_RADIUS, top: s.y - SOUL_RADIUS, width: SOUL_RADIUS * 2, height: SOUL_RADIUS * 2, borderRadius: '50%', background: 'linear-gradient(135deg,#fff,#ffe259 80%)', boxShadow: '0 0 8px #ffe259', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#23234a', zIndex: 2 }}>
            👶
          </div>
        ))}
        {/* Obstacles */}
        {obstacles.map((o, i) => (
          <div key={i} style={{ position: 'absolute', left: o.x - OBSTACLE_RADIUS, top: o.y - OBSTACLE_RADIUS, width: OBSTACLE_RADIUS * 2, height: OBSTACLE_RADIUS * 2, borderRadius: '50%', background: 'linear-gradient(135deg,#e57373,#b71c1c 80%)', boxShadow: '0 0 8px #b71c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', zIndex: 2 }}>
            😈
          </div>
        ))}
        {/* Bonuses */}
        {bonuses.map((b, i) => (
          <div key={i} style={{ position: 'absolute', left: b.x - BONUS_RADIUS, top: b.y - BONUS_RADIUS, width: BONUS_RADIUS * 2, height: BONUS_RADIUS * 2, borderRadius: '50%', background: 'linear-gradient(135deg,#b2ff59,#00e676 80%)', boxShadow: '0 0 8px #00e676', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#222', zIndex: 2 }}>
            ⭐
          </div>
        ))}
        {/* Angel */}
        <div style={{ position: 'absolute', left: angelX - ANGEL_WIDTH / 2, top: HEIGHT - ANGEL_HEIGHT - 6, width: ANGEL_WIDTH, height: ANGEL_HEIGHT, borderRadius: 12, background: 'linear-gradient(135deg,#fff,#6ec6ff 80%)', boxShadow: '0 0 12px #6ec6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#23234a', zIndex: 3, border: '2px solid #fff' }}>
          😇
        </div>
        {/* Score pop */}
        {showScorePop && (
          <div style={{ position: 'absolute', left: angelX - 18, top: HEIGHT - ANGEL_HEIGHT - 32, color: '#ffe600', fontWeight: 700, fontSize: 18, textShadow: '0 0 8px #fff', zIndex: 10, animation: 'popSuccess 0.5s' }}>
            +10
          </div>
        )}
        {/* Game Over overlay */}
        {gameOver && (
          <div style={{ position: 'absolute', left: 0, top: 0, width: WIDTH, height: HEIGHT, background: '#23234acc', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 18 }}>
            <div style={{ color: '#ffe600', fontWeight: 900, fontSize: 32, marginBottom: 10, textShadow: '0 0 18px #fff, 0 0 24px #ffe600', animation: showGameOverEffect ? 'popError 1.1s' : undefined }}>
              💔 GAME OVER
            </div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Score: {score}</div>
            {highScore !== null && (
              <div style={{ color: '#6ec6ff', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>High Score: {highScore}</div>
            )}
            <button onClick={handleRestart} style={{ background: '#6ec6ff', color: '#222', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: 12, padding: '10px 28px', marginTop: 10, boxShadow: '0 2px 12px #6ec6ff88', cursor: 'pointer' }}>Restart</button>
          </div>
        )}
        {/* Lives display */}
        <div style={{ position: 'absolute', left: 10, top: 8, color: '#ffe600', fontWeight: 700, fontSize: 18, textShadow: '0 0 8px #fff', zIndex: 10 }}>
          {Array.from({ length: lives }).map((_, i) => <span key={i}>❤️</span>)}
        </div>
        {/* Score display */}
        <div style={{ position: 'absolute', right: 10, top: 8, color: '#fff', fontWeight: 700, fontSize: 18, textShadow: '0 0 8px #6ec6ff', zIndex: 10 }}>
          {score}
        </div>
      </div>
      <div style={{ color: '#ffe600', fontWeight: 600, fontSize: 14, marginTop: 8, textShadow: '0 0 6px #fff' }}>
        User: {userId || 'Not connected'}
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

export default GuardianAngel;
