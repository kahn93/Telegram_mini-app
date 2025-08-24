import React from 'react';
import Pacman from '../ArcadeGames/Pacman';
import LeaderboardMini from '../ArcadeGames/LeaderboardMini';

const ArcadePacman: React.FC<{ onBack: () => void; userId: string }> = ({ onBack, userId }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
    <button onClick={onBack} style={{ alignSelf: 'flex-start', margin: 8 }}> Back to Arcade</button>
    <Pacman userid={userId} />
    <LeaderboardMini game="Pacman" />
  </div>
);

export default ArcadePacman;
