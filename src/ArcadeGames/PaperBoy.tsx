import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import { submitScoreSupabase } from './leaderboardSupabase';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 480;
const PLAYER_WIDTH = 28;
const PLAYER_HEIGHT = 28;
const HOUSE_WIDTH = 40;
const HOUSE_HEIGHT = 60;
const PAPER_SIZE = 10;
const ROAD_Y = 320;
const OBSTACLE_SIZE = 24;
const MAX_PAPERS = 5;

interface Paper {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

interface House {
  x: number;
  y: number;
  delivered: boolean;
}

interface Obstacle {
  x: number;
  y: number;
  vx: number;
}

const PaperBoy: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [running, setRunning] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [playerX, setPlayerX] = useState(60);
  const [playerY, setPlayerY] = useState(ROAD_Y);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [papersLeft, setPapersLeft] = useState(MAX_PAPERS);
  const keys = useRef<{ [k: string]: boolean }>({});

  // Initialize houses and obstacles
  useEffect(() => {
    setHouses([
      { x: 120, y: 180, delivered: false },
      { x: 220, y: 120, delivered: false },
      { x: 320, y: 200, delivered: false },
    ]);
    setObstacles([
      { x: 400, y: ROAD_Y + 10, vx: -2.2 },
      { x: 600, y: ROAD_Y + 10, vx: -2.7 },
    ]);
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
  }, [running, playerX, playerY, papers, houses, obstacles, gameOver, win, papersLeft]);

  function update(dt: number) {
    if (gameOver || win) return;
    let px = playerX;
    let py = playerY;
    // Player movement
    if (keys.current['ArrowLeft']) px -= 3.2 * dt;
    if (keys.current['ArrowRight']) px += 3.2 * dt;
    if (keys.current['ArrowUp']) py -= 3.2 * dt;
    if (keys.current['ArrowDown']) py += 3.2 * dt;
    px = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, px));
    py = Math.max(ROAD_Y, Math.min(GAME_HEIGHT - PLAYER_HEIGHT, py));
    setPlayerX(px);
    setPlayerY(py);
    // Throw paper
    if (keys.current[' '] && papersLeft > 0) {
      setPapers(papers => [
        ...papers,
        { x: px + PLAYER_WIDTH, y: py + 8, vx: 5.5, vy: -2.2, active: true },
      ]);
      setPapersLeft(p => p - 1);
      keys.current[' '] = false;
    }
    // Move papers
    let newPapers = papers.map(p => ({ ...p, x: p.x + p.vx * dt, y: p.y + p.vy * dt }));
    newPapers = newPapers.filter(p => p.x < GAME_WIDTH && p.y > 0 && p.active);
    // Check delivery
    const newHouses = houses.map(h => ({ ...h }));
    for (const paper of newPapers) {
      for (const house of newHouses) {
        if (!house.delivered &&
          paper.x + PAPER_SIZE > house.x &&
          paper.x < house.x + HOUSE_WIDTH &&
          paper.y + PAPER_SIZE > house.y &&
          paper.y < house.y + HOUSE_HEIGHT
        ) {
          house.delivered = true;
          paper.active = false;
          setScore(s => s + 500);
        }
      }
    }
    setPapers(newPapers);
    setHouses(newHouses);
    // Move obstacles
    const newObstacles = obstacles.map(o => ({ ...o, x: o.x + o.vx * dt }));
    for (const o of newObstacles) {
      if (o.x < -OBSTACLE_SIZE) {
        o.x = GAME_WIDTH + Math.random() * 200;
      }
    }
    setObstacles(newObstacles);
    // Collision with obstacles
    for (const o of newObstacles) {
      if (
        px + PLAYER_WIDTH > o.x &&
        px < o.x + OBSTACLE_SIZE &&
        py + PLAYER_HEIGHT > o.y &&
        py < o.y + OBSTACLE_SIZE
      ) {
        setGameOver(true);
        setRunning(false);
      }
    }
    // Win/lose
    if (newHouses.every(h => h.delivered)) {
      setWin(true);
      setRunning(false);
      setScore(s => s + 1000);
    }
    if (papersLeft === 0 && newPapers.length === 0 && !newHouses.every(h => h.delivered)) {
      setGameOver(true);
      setRunning(false);
    }
  }

  function draw() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Background
    ctx.fillStyle = '#b3e5fc';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Road
    ctx.fillStyle = '#888';
    ctx.fillRect(0, ROAD_Y, GAME_WIDTH, 60);
    // Houses
    for (const h of houses) {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.fillStyle = h.delivered ? '#8bc34a' : '#fff';
      ctx.fillRect(0, 0, HOUSE_WIDTH, HOUSE_HEIGHT);
      ctx.strokeStyle = '#333';
      ctx.strokeRect(0, 0, HOUSE_WIDTH, HOUSE_HEIGHT);
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#333';
      ctx.fillText('🏠', 6, 36);
      ctx.restore();
    }
    // Obstacles
    for (const o of obstacles) {
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.fillStyle = '#f44336';
      ctx.beginPath();
      ctx.arc(OBSTACLE_SIZE / 2, OBSTACLE_SIZE / 2, OBSTACLE_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('🚗', 0, 20);
      ctx.restore();
    }
    // Player
    ctx.save();
    ctx.translate(playerX, playerY);
    ctx.fillStyle = '#1976d2';
    ctx.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('🚴', 0, 24);
    ctx.restore();
    // Papers
    for (const p of papers) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = '#fffde7';
      ctx.fillRect(0, 0, PAPER_SIZE, PAPER_SIZE);
      ctx.strokeStyle = '#333';
      ctx.strokeRect(0, 0, PAPER_SIZE, PAPER_SIZE);
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#333';
      ctx.fillText('📰', 0, 10);
      ctx.restore();
    }
    // Score/papers
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Score: ${score}`, 10, 24);
    ctx.fillText(`Papers Left: ${papersLeft}`, 280, 24);
    if (showInstructions) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(30, 120, 340, 120);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Paper Boy (Mini)', 120, 150);
      ctx.font = '14px sans-serif';
      ctx.fillText('Arrow keys: Move', 80, 180);
      ctx.fillText('Space: Throw paper', 80, 200);
      ctx.fillText('Deliver to houses, avoid cars!', 80, 220);
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
    setPlayerX(60);
    setPlayerY(ROAD_Y);
    setPapers([]);
    setScore(0);
    setGameOver(false);
    setWin(false);
    setRunning(true);
    setShowInstructions(true);
    setPapersLeft(MAX_PAPERS);
    setHouses([
      { x: 120, y: 180, delivered: false },
      { x: 220, y: 120, delivered: false },
      { x: 320, y: 200, delivered: false },
    ]);
    setObstacles([
      { x: 400, y: ROAD_Y + 10, vx: -2.2 },
      { x: 600, y: ROAD_Y + 10, vx: -2.7 },
    ]);
  }

  async function handleSubmitScore() {
    setSubmitting(true);
    try {
      const userId = localStorage.getItem('userId') || 'anon';
      await submitScoreSupabase('paperboy', userId, score);
    } catch {
      // Error intentionally ignored
    }
    setSubmitting(false);
  }

  return (
    <div className="arcade-game-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Paper Boy</h2>
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        style={{ border: '2px solid #fff', background: '#b3e5fc', marginBottom: 16, maxWidth: '100%', height: 'auto' }}
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
        <LeaderboardMini gameId="paperboy" />
      </div>
    </div>
  );
};

export default PaperBoy;
