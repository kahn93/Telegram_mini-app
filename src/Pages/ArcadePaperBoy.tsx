import * as React from 'react';
import PaperBoy from '../ArcadeGames/PaperBoy';
import { useNavigate } from 'react-router-dom';

type ArcadePaperBoyProps = { userId?: string };

const ArcadePaperBoy: React.FC<ArcadePaperBoyProps> = () => {
  const navigate = useNavigate();
  return (
    <div style={{ background: '#b3e5fc', minHeight: '100vh', color: '#333' }}>
      <button onClick={() => navigate('/arcade')} style={{ margin: 16 }}>
        ⬅ Back to Arcade
      </button>
      <PaperBoy />
    </div>
  );
};

export default ArcadePaperBoy;
