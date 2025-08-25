import * as React from 'react';
import RType from '../ArcadeGames/RType';

interface ArcadeRTypeProps {
  userId: string;
}

const ArcadeRType: React.FC<ArcadeRTypeProps> = ({ userId }) => {
  return <RType userId={userId} />;
};

export default ArcadeRType;
