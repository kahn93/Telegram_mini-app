import React from 'react';
import Plinko from '../ArcadeGames/Plinko';
import LeaderboardMini from '../ArcadeGames/LeaderboardMini';

const ArcadePlinko: React.FC<{ onBack: () => void; userId: string }> = ({ onBack, userId }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
    <button onClick={onBack} style={{ alignSelf: 'flex-start', margin: 8 }}> Back to Arcade</button>
    <Plinko userid={userId} />
    <LeaderboardMini game="Plinko" />
  </div>
);

export default ArcadePlinko;
