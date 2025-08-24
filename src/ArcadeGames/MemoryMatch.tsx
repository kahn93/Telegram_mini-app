import React, { useState } from 'react';
import styles from './MemoryMatch.module.scss';

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

const MemoryMatch: React.FC<{ onScore: (score: number) => void }> = ({ onScore }) => {
  const [cards, setCards] = useState(() => shuffle(CARDS));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handleFlip = (idx: number) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx) || gameOver) return;
    setFlipped((prev) => [...prev, idx]);
  };

  React.useEffect(() => {
    if (flipped.length === 2) {
      setMoves((m) => m + 1);
      const [i, j] = flipped;
      if (cards[i] === cards[j]) {
        setMatched((prev) => [...prev, i, j]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  }, [flipped, cards]);

  React.useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameOver(true);
      onScore(1000 - moves * 10);
    }
  }, [matched, cards, moves, onScore]);

  const handleRestart = () => {
    setCards(shuffle(CARDS));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameOver(false);
  };

  return (
    <div className={styles.memoryMatchGame}>
      <h4>Memory Match</h4>
      <div className={styles.memoryGrid}>
        {cards.map((card, idx) => (
          <button
            key={idx}
            className={styles.memoryCard +
              (flipped.includes(idx) || matched.includes(idx) ? ' ' + styles.flipped : '')}
            onClick={() => handleFlip(idx)}
            disabled={flipped.length === 2 || matched.includes(idx) || gameOver}
          >
            <span>{flipped.includes(idx) || matched.includes(idx) ? card : '❓'}</span>
          </button>
        ))}
      </div>
      <div style={{ margin: '12px 0' }}>Moves: {moves}</div>
      {gameOver && (
        <div style={{ color: '#1bbf4c', fontWeight: 700, margin: '8px 0' }}>
          🎉 You matched all cards!
          <button onClick={handleRestart} style={{ marginLeft: 12, background: '#ffe259', borderRadius: 6, padding: '4px 14px', fontWeight: 700 }}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default MemoryMatch;
