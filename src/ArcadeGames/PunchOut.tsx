import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import { submitScoreSupabase } from './leaderboardSupabase';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 480;
const PLAYER_WIDTH = 36;
const PLAYER_HEIGHT = 48;
const ENEMY_WIDTH = 36;
const ENEMY_HEIGHT = 48;
const PUNCH_RANGE = 40;
const PUNCH_COOLDOWN = 18;
const ENEMY_ATTACK_COOLDOWN = 32;
const ENEMY_HEALTH = 5;
const PLAYER_HEALTH = 5;

const PunchOut: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [running, setRunning] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [playerY] = useState(GAME_HEIGHT - 100);
  const [enemyX, setEnemyX] = useState(GAME_WIDTH / 2 - ENEMY_WIDTH / 2);
  const [enemyY] = useState(80);
  const [playerHealth, setPlayerHealth] = useState(PLAYER_HEALTH);
  const [enemyHealth, setEnemyHealth] = useState(ENEMY_HEALTH);
  const [punchCooldown, setPunchCooldown] = useState(0);
  const [enemyAttackCooldown, setEnemyAttackCooldown] = useState(ENEMY_ATTACK_COOLDOWN);
  const [enemyPunching, setEnemyPunching] = useState(false);
  const [playerPunching, setPlayerPunching] = useState(false);
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
  }, [running, playerX, enemyX, playerHealth, enemyHealth, punchCooldown, enemyAttackCooldown, playerPunching, enemyPunching, gameOver, win]);

  function update(dt: number) {
    if (gameOver || win) return;
    let px = playerX;
    // Player movement
    if (keys.current['ArrowLeft']) px -= 3.2 * dt;
    if (keys.current['ArrowRight']) px += 3.2 * dt;
    px = Math.max(40, Math.min(GAME_WIDTH - PLAYER_WIDTH - 40, px));
    setPlayerX(px);
    // Player punch
    if (keys.current[' '] && punchCooldown <= 0) {
      setPlayerPunching(true);
      setPunchCooldown(PUNCH_COOLDOWN);
      // Check hit
      if (
        Math.abs(px + PLAYER_WIDTH / 2 - (enemyX + ENEMY_WIDTH / 2)) < PUNCH_RANGE &&
        Math.abs(playerY - enemyY) < 50 &&
        enemyHealth > 0
      ) {
        setEnemyHealth(h => h - 1);
        setScore(s => s + 200);
      }
      keys.current[' '] = false;
    }
    if (punchCooldown > 0) setPunchCooldown(punchCooldown - 1);
    else setPlayerPunching(false);
    // Enemy AI: move toward player
    let ex = enemyX;
    if (ex < px) ex += 2.2 * dt;
    else if (ex > px) ex -= 2.2 * dt;
    ex = Math.max(40, Math.min(GAME_WIDTH - ENEMY_WIDTH - 40, ex));
    setEnemyX(ex);
    // Enemy punch
    if (enemyAttackCooldown <= 0 && Math.abs(ex - px) < PUNCH_RANGE && Math.abs(playerY - enemyY) < 50 && playerHealth > 0) {
      setEnemyPunching(true);
      setEnemyAttackCooldown(ENEMY_ATTACK_COOLDOWN);
      setPlayerHealth(h => h - 1);
    } else {
      setEnemyPunching(false);
      if (enemyAttackCooldown > 0) setEnemyAttackCooldown(enemyAttackCooldown - 1);
    }
    // Win/lose
    if (enemyHealth <= 0) {
      setWin(true);
      setRunning(false);
      setScore(s => s + 1000);
    }
    if (playerHealth <= 0) {
      setGameOver(true);
      setRunning(false);
    }
  }

  function draw() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Background
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Ring
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 60, GAME_WIDTH - 60, GAME_HEIGHT - 120);
    // Enemy
    ctx.save();
    ctx.translate(enemyX, enemyY);
    ctx.fillStyle = '#e53935';
    ctx.fillRect(0, 0, ENEMY_WIDTH, ENEMY_HEIGHT);
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('🥊', 0, 38);
    if (enemyPunching) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(ENEMY_WIDTH - 6, 18, 18, 8);
    }
    ctx.restore();
    // Player
    ctx.save();
    ctx.translate(playerX, playerY);
    ctx.fillStyle = '#43a047';
    ctx.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('🥊', 0, 38);
    if (playerPunching) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(-12, 18, 18, 8);
    }
    ctx.restore();
    // Health bars
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('You', 60, GAME_HEIGHT - 20);
    ctx.fillText('Enemy', 260, 50);
    ctx.fillStyle = '#43a047';
    ctx.fillRect(100, GAME_HEIGHT - 30, 30 * playerHealth, 12);
    ctx.fillStyle = '#e53935';
    ctx.fillRect(320, 40, 30 * enemyHealth, 12);
    // Score
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Score: ${score}`, 10, 24);
    if (showInstructions) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(30, 120, 340, 120);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Punch Out (Mini)', 120, 150);
      ctx.font = '14px sans-serif';
      ctx.fillText('Arrow keys: Move', 80, 180);
      ctx.fillText('Space: Punch', 80, 200);
      ctx.fillText('Defeat the enemy boxer!', 80, 220);
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
    setEnemyX(GAME_WIDTH / 2 - ENEMY_WIDTH / 2);
    setPlayerHealth(PLAYER_HEALTH);
    setEnemyHealth(ENEMY_HEALTH);
    setScore(0);
    setGameOver(false);
    setWin(false);
    setRunning(true);
    setShowInstructions(true);
    setPunchCooldown(0);
    setEnemyAttackCooldown(ENEMY_ATTACK_COOLDOWN);
    setPlayerPunching(false);
    setEnemyPunching(false);
  }

  async function handleSubmitScore() {
    setSubmitting(true);
    try {
      const userId = localStorage.getItem('userId') || 'anon';
      await submitScoreSupabase('punchout', userId, score);
    } catch {
      // Error intentionally ignored
    }
    setSubmitting(false);
  }

  return (
    <div className="arcade-game-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Punch Out</h2>
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        style={{ border: '2px solid #fff', background: '#222', marginBottom: 16, maxWidth: '100%', height: 'auto' }}
        tabIndex={0}
      />
      {(gameOver || win) && (
        <div style={{ margin: 8 }}>
          <button onClick={restart} onTouchStart={restart} style={{ marginRight: 12 }}>
            Restart
          </button>
          <button onClick={handleSubmitScore} onTouchStart={handleSubmitScore} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Score'}
          </button>
        </div>
      )}
      <div style={{ marginTop: 24, width: '100%' }}>
        <LeaderboardMini gameId="punchout" />
      </div>
    </div>
  );
};

export default PunchOut;
