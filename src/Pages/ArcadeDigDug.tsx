import * as React from 'react';
import DigDug from '../ArcadeGames/DigDug';

const ArcadeDigDug: React.FC = () => {
  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <button onClick={() => window.history.back()} style={{ margin: '12px 0' }}>
        ← Back to Arcade
      </button>
      <DigDug />
    </div>
  );
};

export default ArcadeDigDug;
