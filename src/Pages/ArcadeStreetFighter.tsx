import * as React from 'react';
import StreetFighter from '../ArcadeGames/StreetFighter';

interface ArcadeStreetFighterProps {
  userId: string;
}

const ArcadeStreetFighter: React.FC<ArcadeStreetFighterProps> = (props: ArcadeStreetFighterProps) => {
  return <StreetFighter userId={props.userId} />;
};

export default ArcadeStreetFighter;
