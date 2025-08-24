import React from 'react';
import Asteroids from '../ArcadeGames/Asteroids';
import LeaderboardMini from '../ArcadeGames/LeaderboardMini';

const ArcadeAsteroids: React.FC<{ onBack: () => void; userId: string }> = ({ onBack, userId }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
    <button onClick={onBack} style={{ alignSelf: 'flex-start', margin: 8 }}> Back to Arcade</button>
    <Asteroids userid={userId} />
    <LeaderboardMini game="Asteroids" />
  </div>
);

export default ArcadeAsteroids;
