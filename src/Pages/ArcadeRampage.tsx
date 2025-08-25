import * as React from 'react';
import Rampage from '../ArcadeGames/Rampage';

const ArcadeRampage: React.FC<{ userId: string }> = ({ userId }) => {
  return <Rampage userId={userId} />;
};

export default ArcadeRampage;
