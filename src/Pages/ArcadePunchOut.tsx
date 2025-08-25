import * as React from 'react';
import PunchOut from '../ArcadeGames/PunchOut';
import { useNavigate } from 'react-router-dom';

const ArcadePunchOut: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ background: '#222', minHeight: '100vh', color: '#fff' }}>
      <button onClick={() => navigate('/arcade')} style={{ margin: 16 }}>
        ⬅ Back to Arcade
      </button>
      <PunchOut />
    </div>
  );
};

export default ArcadePunchOut;
