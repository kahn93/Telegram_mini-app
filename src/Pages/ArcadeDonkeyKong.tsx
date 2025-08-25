import * as React from 'react';
import DonkeyKong from '../ArcadeGames/DonkeyKong';

interface ArcadeDonkeyKongProps {
  onBack: () => void;
}

const ArcadeDonkeyKong: React.FC<ArcadeDonkeyKongProps> = ({ onBack }) => {
  return (
    <div style={{ padding: 24 }}>
      <button onClick={onBack} style={{ marginBottom: 16 }}>&larr; Back to Arcade</button>
      <DonkeyKong />
    </div>
  );
};

export default ArcadeDonkeyKong;
