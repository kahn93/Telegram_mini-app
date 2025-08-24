import React, { useEffect, useState } from 'react';
import './GameStyles.css';
import { submitScoreSupabase } from './leaderboardSupabase';

// Lightweight Pacman implementation (simplified for mini-game)
const GRID_SIZE = 10;
const INITIAL_PACMAN = { x: 1, y: 1, dir: 'right' };
const INITIAL_GHOST = { x: 8, y: 8 };
const DOTS = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);

function getIndex(x: number, y: number) {
  return y * GRID_SIZE + x;
}

const Pacman: React.FC<{ userid?: string }> = ({ userid }) => {
  const [pacman, setPacman] = useState(INITIAL_PACMAN);
  const [ghost, setGhost] = useState(INITIAL_GHOST);
  const [dots, setDots] = useState(DOTS);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Auto-restart after game over
  useEffect(() => {
    if (gameOver) {
      const t = setTimeout(() => {
        setPacman(INITIAL_PACMAN);
        setGhost(INITIAL_GHOST);
        setDots(DOTS);
        setScore(0);
        setGameOver(false);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [gameOver]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      setPacman((p) => {
        let { x, y, dir } = p;
        if (e.key === 'ArrowUp') y = Math.max(0, y - 1), dir = 'up';
        if (e.key === 'ArrowDown') y = Math.min(GRID_SIZE - 1, y + 1), dir = 'down';
        if (e.key === 'ArrowLeft') x = Math.max(0, x - 1), dir = 'left';
        if (e.key === 'ArrowRight') x = Math.min(GRID_SIZE - 1, x + 1), dir = 'right';
        return { x, y, dir };
      });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    // Ghost moves randomly
    const interval = setInterval(() => {
      setGhost((g) => {
        const moves = [
          { x: g.x + 1, y: g.y },
          { x: g.x - 1, y: g.y },
          { x: g.x, y: g.y + 1 },
          { x: g.x, y: g.y - 1 },
        ].filter(({ x, y }) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE);
        return moves[Math.floor(Math.random() * moves.length)] || g;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [gameOver]);

  useEffect(() => {
    // Eat dot
    const idx = getIndex(pacman.x, pacman.y);
    if (dots.includes(idx)) {
      setDots((d) => d.filter((i) => i !== idx));
      setScore((s) => s + 10);
    }
    // Check collision
    if (pacman.x === ghost.x && pacman.y === ghost.y) {
      setFinalScore(score);
      setGameOver(true);
    }
    // Win
    if (dots.length === 0) {
      setFinalScore(score);
      setGameOver(true);
    }
  }, [pacman, ghost, dots, score]);

  // Submit score to Supabase leaderboard on game over
  useEffect(() => {
    if (gameOver && finalScore > 0 && userid) {
      submitScoreSupabase('Pacman', userid, finalScore);
    }
  }, [gameOver, finalScore, userid]);

  return (
    <div className="arcade-game">
      <h4>Pacman</h4>
      <div className="arcade-grid">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE, y = Math.floor(i / GRID_SIZE);
          let content = '';
          if (pacman.x === x && pacman.y === y) content = '😋';
          else if (ghost.x === x && ghost.y === y) content = '👻';
          else if (dots.includes(i)) content = '•';
          return <div className="arcade-cell" key={i}>{content}</div>;
        })}
      </div>
      <div>Score: {score}</div>
      {gameOver && <div>{dots.length === 0 ? 'You Win!' : 'Game Over'}</div>}
    </div>
  );
};

export default Pacman;
