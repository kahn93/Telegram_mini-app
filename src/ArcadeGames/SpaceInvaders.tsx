import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import { submitScoreSupabase } from './leaderboardSupabase';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 480;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 18;
const PLAYER_Y = GAME_HEIGHT - 40;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 12;
const ENEMY_ROWS = 5;
const ENEMY_COLS = 10;
const ENEMY_WIDTH = 28;
const ENEMY_HEIGHT = 18;
const ENEMY_X_GAP = 8;
const ENEMY_Y_GAP = 18;
const ENEMY_START_Y = 60;
const ENEMY_SPEED = 0.7;
const ENEMY_DESCEND = 18;
const ENEMY_BULLET_SPEED = 2.2;
const PLAYER_BULLET_SPEED = 5.5;
const ENEMY_FIRE_CHANCE = 0.008;

interface Bullet {
  x: number;
  y: number;
  vy: number;
  fromEnemy: boolean;
}

interface Enemy {
  x: number;
  y: number;
  alive: boolean;
}

const SpaceInvaders: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(() => {
    const stored = localStorage.getItem('si_score');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(() => {
    const stored = localStorage.getItem('si_gameOver');
    return stored ? JSON.parse(stored) : false;
  });
  const [win, setWin] = useState(() => {
    const stored = localStorage.getItem('si_win');
    return stored ? JSON.parse(stored) : false;
  });
  const [running, setRunning] = useState(() => {
    const stored = localStorage.getItem('si_running');
    return stored ? JSON.parse(stored) : true;
  });
  const [showInstructions, setShowInstructions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [playerX, setPlayerX] = useState(() => {
    const stored = localStorage.getItem('si_playerX');
    return stored ? parseFloat(stored) : GAME_WIDTH / 2 - PLAYER_WIDTH / 2;
  });
  const [playerLives, setPlayerLives] = useState(() => {
    const stored = localStorage.getItem('si_playerLives');
    return stored ? parseInt(stored, 10) : 3;
  });
  const [bullets, setBullets] = useState<Bullet[]>(() => {
    const stored = localStorage.getItem('si_bullets');
    return stored ? JSON.parse(stored) : [];
  });
  const [enemies, setEnemies] = useState<Enemy[]>(() => {
    const stored = localStorage.getItem('si_enemies');
    return stored ? JSON.parse(stored) : [];
  });
  const [enemyDir, setEnemyDir] = useState(() => {
    const stored = localStorage.getItem('si_enemyDir');
    return stored ? parseInt(stored, 10) : 1;
  });
  const [enemyStep, setEnemyStep] = useState(() => {
    const stored = localStorage.getItem('si_enemyStep');
    return stored ? parseInt(stored, 10) : 0;
  });
  const keys = useRef<{ [k: string]: boolean }>({});
  // Auto-save logic
  useEffect(() => {
    localStorage.setItem('si_playerX', playerX.toString());
  }, [playerX]);
  useEffect(() => {
    localStorage.setItem('si_playerLives', playerLives.toString());
  }, [playerLives]);
  useEffect(() => {
    localStorage.setItem('si_bullets', JSON.stringify(bullets));
  }, [bullets]);
  useEffect(() => {
    localStorage.setItem('si_enemies', JSON.stringify(enemies));
  }, [enemies]);
  useEffect(() => {
    localStorage.setItem('si_enemyDir', enemyDir.toString());
  }, [enemyDir]);
  useEffect(() => {
    localStorage.setItem('si_enemyStep', enemyStep.toString());
  }, [enemyStep]);
  useEffect(() => {
    localStorage.setItem('si_score', score.toString());
  }, [score]);
  useEffect(() => {
    localStorage.setItem('si_gameOver', JSON.stringify(gameOver));
  }, [gameOver]);
  useEffect(() => {
    localStorage.setItem('si_win', JSON.stringify(win));
  }, [win]);
  useEffect(() => {
    localStorage.setItem('si_running', JSON.stringify(running));
  }, [running]);

  // Initialize enemies
  useEffect(() => {
    const arr: Enemy[] = [];
    for (let row = 0; row < ENEMY_ROWS; ++row) {
      for (let col = 0; col < ENEMY_COLS; ++col) {
        arr.push({
          x: 30 + col * (ENEMY_WIDTH + ENEMY_X_GAP),
          y: ENEMY_START_Y + row * (ENEMY_HEIGHT + ENEMY_Y_GAP),
          alive: true,
        });
      }
    }
    setEnemies(arr);
  }, []);

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
  }, [running, playerX, bullets, enemies, gameOver, win]);

  function update(dt: number) {
    if (gameOver || win) return;
    let px = playerX;
    // Player movement
    if (keys.current['ArrowLeft']) px -= 4 * dt;
    if (keys.current['ArrowRight']) px += 4 * dt;
    px = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, px));
    setPlayerX(px);
    // Fire
    if (keys.current[' '] && bullets.filter(b => !b.fromEnemy).length < 2) {
      setBullets(bullets => [
        ...bullets,
        { x: px + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2, y: PLAYER_Y, vy: -PLAYER_BULLET_SPEED, fromEnemy: false },
      ]);
      keys.current[' '] = false;
    }
    // Bullets
    let newBullets = bullets.map(b => ({ ...b, y: b.y + b.vy * dt }));
    // Remove off-screen
    newBullets = newBullets.filter(b => b.y > -BULLET_HEIGHT && b.y < GAME_HEIGHT + BULLET_HEIGHT);
    // Enemy movement
    const minX = Math.min(...enemies.filter(e => e.alive).map(e => e.x), GAME_WIDTH);
    const maxX = Math.max(...enemies.filter(e => e.alive).map(e => e.x + ENEMY_WIDTH), 0);
    let dir = enemyDir;
    let step = enemyStep;
    if (minX <= 10 && dir === -1) {
      dir = 1;
      step++;
      for (const e of enemies) if (e.alive) e.y += ENEMY_DESCEND;
    } else if (maxX >= GAME_WIDTH - 10 && dir === 1) {
      dir = -1;
      step++;
      for (const e of enemies) if (e.alive) e.y += ENEMY_DESCEND;
    }
    for (const e of enemies) if (e.alive) e.x += dir * ENEMY_SPEED * dt * (1 + step * 0.1);
    setEnemyDir(dir);
    setEnemyStep(step);
    // Enemy fire
    for (const e of enemies) {
      if (e.alive && Math.random() < ENEMY_FIRE_CHANCE * dt) {
        setBullets(bullets => [
          ...bullets,
          { x: e.x + ENEMY_WIDTH / 2 - BULLET_WIDTH / 2, y: e.y + ENEMY_HEIGHT, vy: ENEMY_BULLET_SPEED, fromEnemy: true },
        ]);
      }
    }
    // Bullet collisions
    for (const b of newBullets) {
      if (!b.fromEnemy) {
        for (const e of enemies) {
          if (
            e.alive &&
            b.x < e.x + ENEMY_WIDTH &&
            b.x + BULLET_WIDTH > e.x &&
            b.y < e.y + ENEMY_HEIGHT &&
            b.y + BULLET_HEIGHT > e.y
          ) {
            e.alive = false;
            b.y = -1000;
            setScore(s => s + 100);
          }
        }
      } else {
        // Enemy bullet hits player
        if (
          b.x < px + PLAYER_WIDTH &&
          b.x + BULLET_WIDTH > px &&
          b.y < PLAYER_Y + PLAYER_HEIGHT &&
          b.y + BULLET_HEIGHT > PLAYER_Y
        ) {
          setPlayerLives(l => l - 1);
          b.y = GAME_HEIGHT + 1000;
        }
      }
    }
    setBullets(newBullets);
    setEnemies([...enemies]);
    // Win/lose
    if (enemies.every(e => !e.alive)) {
      setWin(true);
      setRunning(false);
      setScore(s => s + 1000);
    }
    if (playerLives <= 0 || enemies.some(e => e.alive && e.y + ENEMY_HEIGHT >= PLAYER_Y)) {
      setGameOver(true);
      setRunning(false);
    }
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
    // Enemies
    for (const e of enemies) {
      if (!e.alive) continue;
      ctx.save();
      ctx.translate(e.x + ENEMY_WIDTH / 2, e.y + ENEMY_HEIGHT / 2);
      ctx.scale(1.2, 1.2);
      ctx.fillStyle = '#39f';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('👾', -10, 7);
      ctx.restore();
    }
    // Player
    ctx.save();
    ctx.translate(playerX + PLAYER_WIDTH / 2, PLAYER_Y + PLAYER_HEIGHT / 2);
    ctx.fillStyle = '#0f0';
    ctx.beginPath();
    ctx.ellipse(0, 0, PLAYER_WIDTH / 2, PLAYER_HEIGHT / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px sans-serif';
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
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Lives: ${playerLives}`, 320, 20);
    if (showInstructions) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(30, 120, 340, 120);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Space Invaders (Mini)', 90, 150);
      ctx.font = '14px sans-serif';
      ctx.fillText('Arrow keys: Move', 80, 180);
      ctx.fillText('Space: Fire', 80, 200);
      ctx.fillText('Destroy all invaders!', 80, 220);
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
    setPlayerX(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
    setPlayerLives(3);
    setBullets([]);
    setScore(0);
    setGameOver(false);
    setWin(false);
    setRunning(true);
    setShowInstructions(true);
    // Reset enemies
    const arr: Enemy[] = [];
    for (let row = 0; row < ENEMY_ROWS; ++row) {
      for (let col = 0; col < ENEMY_COLS; ++col) {
        arr.push({
          x: 30 + col * (ENEMY_WIDTH + ENEMY_X_GAP),
          y: ENEMY_START_Y + row * (ENEMY_HEIGHT + ENEMY_Y_GAP),
          alive: true,
        });
      }
    }
    setEnemies(arr);
    setEnemyDir(1);
    setEnemyStep(0);
  }

  async function handleSubmitScore() {
    setSubmitting(true);
    try {
      const userId = localStorage.getItem('userId') || 'anon';
      await submitScoreSupabase('space_invaders', userId, score);
    } catch {}
    setSubmitting(false);
  }

  return (
    <div className="arcade-game-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Space Invaders</h2>
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
        <LeaderboardMini gameId="space_invaders" />
      </div>
    </div>
  );
};

export default SpaceInvaders;
