import * as React from 'react';
import Qbert from '../ArcadeGames/Qbert';

const ArcadeQbert: React.FC<{ userId: string }> = ({ userId }) => {
  return <Qbert userId={userId} />;
};

export default ArcadeQbert;
