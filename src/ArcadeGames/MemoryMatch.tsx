import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './MemoryMatch.module.scss';
import { playSound, isMuted } from '../soundManager';

const CARD_PAIRS = [
  '🍎', '🍌', '🍇', '🍉', '🍒', '🍋', '🍍', '🥝'
];
const CARDS = [...CARD_PAIRS, ...CARD_PAIRS];

function shuffle<T>(array: T[]): T[] {
  return array
    .map((v) => [Math.random(), v] as [number, T])
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v);
}


interface MemoryMatchProps {
  onScore: (score: number) => void;
  userid?: string;
  muted?: boolean;
}

const MemoryMatch: React.FC<MemoryMatchProps> = ({ onScore, userid: propUserId, muted }) => {
  // Remove unused userId logic

  const [cards, setCards] = useState(() => {
    const stored = localStorage.getItem('mm_cards');
    return stored ? JSON.parse(stored) : shuffle(CARDS);
  });
  const [flipped, setFlipped] = useState<number[]>(() => {
    const stored = localStorage.getItem('mm_flipped');
    return stored ? JSON.parse(stored) : [];
  });
  const [matched, setMatched] = useState<number[]>(() => {
    const stored = localStorage.getItem('mm_matched');
    return stored ? JSON.parse(stored) : [];
  });
  const [moves, setMoves] = useState(() => {
    const stored = localStorage.getItem('mm_moves');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(() => {
    const stored = localStorage.getItem('mm_gameOver');
    return stored ? JSON.parse(stored) : false;
  });
  const [score, setScore] = useState(() => {
    const stored = localStorage.getItem('mm_score');
    return stored ? parseInt(stored, 10) : 0;
  });
  // Remove unused setScore warning by updating score on game over
  useEffect(() => {
    localStorage.setItem('mm_cards', JSON.stringify(cards));
  }, [cards]);
  useEffect(() => {
    localStorage.setItem('mm_flipped', JSON.stringify(flipped));
  }, [flipped]);
  useEffect(() => {
    localStorage.setItem('mm_matched', JSON.stringify(matched));
  }, [matched]);
  useEffect(() => {
    localStorage.setItem('mm_moves', moves.toString());
  }, [moves]);
  useEffect(() => {
    localStorage.setItem('mm_gameOver', JSON.stringify(gameOver));
  }, [gameOver]);
  useEffect(() => {
    localStorage.setItem('mm_score', score.toString());
  }, [score]);

  const [showScorePop, setShowScorePop] = useState(false);
  const [showGameOverEffect, setShowGameOverEffect] = useState(false);

  useEffect(() => {
    if (flipped.length === 2) {
      setMoves((m) => m + 1);
      const [i, j] = flipped;
      if (cards[i] === cards[j]) {
        setMatched((prev) => [...prev, i, j]);
        setFlipped([]);
        if (!muted && !isMuted()) playSound('win');
        setShowScorePop(true);
        setTimeout(() => setShowScorePop(false), 700);
      } else {
        setTimeout(() => setFlipped([]), 800);
        if (!muted && !isMuted()) playSound('spin');
      }
    }
  }, [flipped, cards, muted]);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameOver(true);
      setShowGameOverEffect(true);
      if (!muted && !isMuted()) playSound('bonus');
      const finalScore = 1000 - moves * 10;
      setScore(finalScore);
      onScore(finalScore);
      setTimeout(() => setShowGameOverEffect(false), 1200);
    }
  }, [matched, cards, moves, onScore, muted]);

  const handleRestart = () => {
    setCards(shuffle(CARDS));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameOver(false);
    setShowGameOverEffect(false);
    setScore(0);
    if (!muted && !isMuted()) playSound('button');
  };

  // Animated floating cards background
  const bgCards = Array.from({ length: 10 }, (_, i) => ({
    x: Math.random() * 320,
    y: Math.random() * 320,
    emoji: CARD_PAIRS[i % CARD_PAIRS.length],
    opacity: 0.10 + Math.random() * 0.18,
  }));

    function handleFlip(idx: number): void {
        throw new Error('Function not implemented.');
    }

  return (
    <div
      className={styles.memoryMatchGame}
      style={{
        background: 'radial-gradient(ellipse at 60% 40%, #23234a 70%, #18182a 100%)',
        borderRadius: 18,
        boxShadow: '0 0 32px #ffe259',
        padding: 24,
        maxWidth: 340,
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated floating cards background */}
      <svg width={340} height={340} style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }}>
        {bgCards.map((d, i) => (
          <text key={i} x={d.x} y={d.y + (Math.sin(Date.now() / 800 + i) * 10)} fontSize="32" opacity={d.opacity}>
            {d.emoji}
          </text>
        ))}
      </svg>
      <h4 style={{ color: '#ffe259', textShadow: '0 0 8px #fff', marginBottom: 8, zIndex: 2, position: 'relative' }}>Memory Match</h4>
      <div className={styles.memoryGrid} style={{ zIndex: 2, position: 'relative' }}>
        {cards.map((card: string, idx: number) => (
          <button
            key={idx}
            className={
              styles.memoryCard +
              (flipped.includes(idx) || matched.includes(idx) ? ' ' + styles.flipped : '')
            }
            onClick={() => handleFlip(idx)}
            onTouchStart={() => handleFlip(idx)}
            disabled={flipped.length === 2 || matched.includes(idx) || gameOver}
            style={{
              boxShadow: flipped.includes(idx) || matched.includes(idx)
                ? '0 0 12px #ffe259'
                : '0 0 4px #fff',
              background: flipped.includes(idx) || matched.includes(idx)
                ? 'linear-gradient(135deg,#ffe259,#fff)' : '#23234a',
              color: flipped.includes(idx) || matched.includes(idx) ? '#23234a' : '#ffe259',
              fontWeight: 700,
              fontSize: 24,
              borderRadius: 10,
              transition: 'all 0.2s',
            }}
          >
            <span>{flipped.includes(idx) || matched.includes(idx) ? card : '❓'}</span>
          </button>
        ))}
      </div>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: '10px 0 2px', textShadow: '0 0 8px #ffe259', zIndex: 2, position: 'relative', animation: showScorePop ? 'popSuccess 0.5s' : undefined }}>
        Moves: {moves}
      </div>
      {gameOver && (
        <div
          style={{
            color: '#1bbf4c',
            fontWeight: 700,
            margin: '8px 0',
            fontSize: 22,
            textShadow: '0 0 18px #fff, 0 0 24px #1bbf4c',
            animation: showGameOverEffect ? 'popError 1.1s' : undefined,
            zIndex: 3,
            position: 'relative',
          }}
        >
          🎉 You matched all cards!
          <div style={{ marginTop: 8 }}>Score: {score}</div>
          <button
            onClick={handleRestart}
            onTouchStart={handleRestart}
            style={{
              marginLeft: 12,
              background: '#ffe259',
              borderRadius: 6,
              padding: '4px 14px',
              fontWeight: 700,
              color: '#23234a',
              boxShadow: '0 0 8px #ffe259',
              border: 'none',
              fontSize: 16,
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            Play Again
          </button>
        </div>
      )}
  {/* Removed unused userId display */}
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

export default MemoryMatch;
