import * as React from 'react';
import Galaga from '../ArcadeGames/Galaga';
import { useNavigate } from 'react-router-dom';

const ArcadeGalaga: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ background: '#111', minHeight: '100vh', color: '#fff' }}>
      <button onClick={() => navigate('/arcade')} style={{ margin: 16 }}>
        ⬅ Back to Arcade
      </button>
      <Galaga />
    </div>
  );
};

export default ArcadeGalaga;
