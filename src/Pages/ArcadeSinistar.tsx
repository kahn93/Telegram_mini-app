import * as React from 'react';
import Sinistar from '../ArcadeGames/Sinistar';

interface ArcadeSinistarProps {
  onBack: () => void;
  userId: string;
}

const ArcadeSinistar: React.FC<ArcadeSinistarProps> = ({ onBack }) => {
  return (
    <div style={{ padding: 24 }}>
      <button onClick={onBack} style={{ marginBottom: 16 }}>&larr; Back to Arcade</button>
      <Sinistar />
    </div>
  );
};

export default ArcadeSinistar;
