import * as React from 'react';
import Commando from '../ArcadeGames/Commando';

const ArcadeCommando: React.FC = () => {
  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <button onClick={() => window.history.back()} style={{ margin: '12px 0' }}>
        ← Back to Arcade
      </button>
      <Commando />
    </div>
  );
};

export default ArcadeCommando;
