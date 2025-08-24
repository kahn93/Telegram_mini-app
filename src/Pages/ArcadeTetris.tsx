import React from 'react';
import Tetris from '../ArcadeGames/Tetris';
import LeaderboardMini from '../ArcadeGames/LeaderboardMini';

const ArcadeTetris: React.FC<{ onBack: () => void; userId: string }> = ({ onBack, userId }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
    <button onClick={onBack} style={{ alignSelf: 'flex-start', margin: 8 }}> Back to Arcade</button>
    <Tetris userid={userId} />
    <LeaderboardMini game="Tetris" />
  </div>
);

export default ArcadeTetris;
