import React, { useState } from 'react';
import './GameStyles.css';
import { submitScoreSupabase } from './leaderboardSupabase';

// Lightweight Plinko mini-game
const ROWS = 8, COLS = 7;

const Plinko: React.FC<{ userid?: string }> = ({ userid }) => {
  const [ballCol, setBallCol] = useState(Math.floor(COLS / 2));
  const [row, setRow] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Auto-restart after game over
  React.useEffect(() => {
    if (gameOver) {
      const t = setTimeout(() => {
        setBallCol(Math.floor(COLS / 2));
        setRow(0);
        setScore(0);
        setGameOver(false);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [gameOver]);

  const dropBall = () => {
    if (gameOver) return;
    let col = ballCol;
    for (let r = 0; r < ROWS; r++) {
      col += Math.random() < 0.5 ? -1 : 1;
      col = Math.max(0, Math.min(COLS - 1, col));
    }
    setRow(ROWS);
    setBallCol(col);
    const points = [10, 20, 50, 100, 50, 20, 10][col];
    setScore(points);
    setGameOver(true);
  };

  // Submit score to Supabase leaderboard on game over
  React.useEffect(() => {
    if (gameOver && score > 0 && userid) {
      submitScoreSupabase('Plinko', userid, score);
    }
  }, [gameOver, score, userid]);

  // Render pegs in a triangle pattern
  const renderPegs = () => {
    const pegs = [];
    for (let y = 1; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if ((y + x) % 2 === 1) {
          pegs.push(
            <div
              className="plinko-peg"
              style={{ gridColumn: x + 1, gridRow: y + 1 }}
              key={`peg-${x}-${y}`}
            >
              ●
            </div>
          );
        }
      }
    }
    return pegs;
  };

  // Render buckets at the bottom
  const renderBuckets = () => (
    <div style={{ display: 'flex', width: COLS * 20, margin: '0 auto' }}>
      {[10, 20, 50, 100, 50, 20, 10].map((points, i) => (
        <div className="plinko-bucket" style={{ width: 20 }} key={i}>{points}</div>
      ))}
    </div>
  );

  return (
    <div className="arcade-game">
      <h4>Plinko</h4>
      <div className="arcade-grid plinko-grid" style={{ position: 'relative' }}>
        {Array.from({ length: ROWS * COLS }).map((_, i) => {
          const x = i % COLS, y = Math.floor(i / COLS);
          let content = '';
          if (y === row && x === ballCol) content = '⚪';
          return <div className="arcade-cell" key={i}>{content}</div>;
        })}
        {renderPegs()}
      </div>
      {renderBuckets()}
      <button onClick={dropBall} disabled={gameOver}>Drop Ball</button>
      <div>Score: {score}</div>
      {gameOver && <div>Game Over</div>}
    </div>
  );
};

export default Plinko;
