import React, { useEffect, useState } from 'react';
import './GameStyles.css';

// Lightweight Tetris mini-game
const ROWS = 16, COLS = 10;
const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]], // Z
  [[1, 0, 0], [1, 1, 1]], // J
  [[0, 0, 1], [1, 1, 1]], // L
];

function randomShape() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { shape, x: 3, y: 0 };
}

const Tetris: React.FC<{ onScore: (score: number) => void }> = ({ onScore }) => {
  const [board, setBoard] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [current, setCurrent] = useState(randomShape());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Auto-restart after game over
  useEffect(() => {
    if (gameOver) {
      const t = setTimeout(() => {
        setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
        setCurrent(randomShape());
        setScore(0);
        setGameOver(false);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [gameOver]);

  const merge = (b: number[][], c: { shape: number[][]; x: number; y: number }) => {
    const newB = b.map((row) => [...row]);
    c.shape.forEach((row: number[], dy: number) =>
      row.forEach((cell, dx) => {
        if (cell) {
          const x = c.x + dx, y = c.y + dy;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) newB[y][x] = 1;
        }
      })
    );
    return newB;
  };

  const canMove = React.useCallback((dx: number, dy: number, shape = current.shape) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const nx = current.x + dx + x, ny = current.y + dy + y;
          if (nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && board[ny][nx])) return false;
        }
      }
    }
    return true;
  }, [current, board]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      if (canMove(0, 1)) {
        setCurrent((c) => ({ ...c, y: c.y + 1 }));
      } else {
        setBoard((b) => merge(b, current));
        // Clear lines
        setBoard((b) => {
          const newB = b.filter((row) => row.some((cell) => !cell));
          const lines = ROWS - newB.length;
          if (lines > 0) {
            setScore((s) => s + lines * 100);
          }
          return [
            ...Array.from({ length: lines }, () => Array(COLS).fill(0)),
            ...newB,
          ];
        });
        setCurrent(randomShape());
        if (!canMove(0, 0)) setGameOver(true);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [current, board, gameOver, canMove]);

  // Submit score to leaderboard on game over
  useEffect(() => {
    if (gameOver && score > 0) {
      onScore(score);
    }
  }, [gameOver, score, onScore]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft' && canMove(-1, 0)) setCurrent((c) => ({ ...c, x: c.x - 1 }));
      if (e.key === 'ArrowRight' && canMove(1, 0)) setCurrent((c) => ({ ...c, x: c.x + 1 }));
      if (e.key === 'ArrowDown' && canMove(0, 1)) setCurrent((c) => ({ ...c, y: c.y + 1 }));
      if (e.key === 'ArrowUp') {
        // Rotate
        const rotated = current.shape[0].map((_, i) => current.shape.map((row: number[]) => row[i]).reverse());
        if (canMove(0, 0, rotated)) setCurrent((c) => ({ ...c, shape: rotated }));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, board, gameOver, canMove]);

  // Render board with current piece overlaid
  const renderBoard = () => {
    // Copy board
    const display = board.map(row => [...row]);
    // Overlay current piece
    current.shape.forEach((r: number[], dy: number) =>
      r.forEach((v, dx) => {
        if (v) {
          const x = current.x + dx, y = current.y + dy;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) display[y][x] = 2;
        }
      })
    );
    return display.map((row, y) =>
      row.map((cell, x) => (
        <div
          className={cell === 2 ? 'arcade-cell tetris-active' : cell ? 'arcade-cell tetris-filled' : 'arcade-cell'}
          key={x + '-' + y}
        />
      ))
    );
  };

  return (
    <div className="arcade-game">
      <h4>Tetris</h4>
      <div className="arcade-grid tetris-grid">
        {renderBoard()}
      </div>
      <div>Score: {score}</div>
      {gameOver && <div>Game Over</div>}
    </div>
  );
};

export default Tetris;
