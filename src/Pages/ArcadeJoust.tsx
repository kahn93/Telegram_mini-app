import * as React from 'react';
import Joust from '../ArcadeGames/Joust';

interface ArcadeJoustProps {
  onBack: () => void;
}

const ArcadeJoust: React.FC<ArcadeJoustProps> = ({ onBack }) => {
  return (
    <div style={{ padding: 24 }}>
      <button onClick={onBack} style={{ marginBottom: 16 }}>&larr; Back to Arcade</button>
      <Joust />
    </div>
  );
};

export default ArcadeJoust;
