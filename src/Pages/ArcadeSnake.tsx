import * as React from 'react';
import SnakeGame from '../ArcadeGames/Snake';

const ArcadeSnake: React.FC = () => {
  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <button onClick={() => window.history.back()} style={{ margin: '12px 0' }}>
        ← Back to Arcade
      </button>
      <SnakeGame />
    </div>
  );
};

export default ArcadeSnake;
