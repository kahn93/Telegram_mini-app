import * as React from 'react';
import Centipede from '../ArcadeGames/Centipede';

const ArcadeCentipede: React.FC = () => {
  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <button onClick={() => window.history.back()} style={{ margin: '12px 0' }}>
        ← Back to Arcade
      </button>
      <Centipede />
    </div>
  );
};

export default ArcadeCentipede;
