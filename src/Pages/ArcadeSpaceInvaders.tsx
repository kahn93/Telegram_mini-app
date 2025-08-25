import * as React from 'react';
import SpaceInvaders from '../ArcadeGames/SpaceInvaders';

interface ArcadeSpaceInvadersProps {
  onBack: () => void;
}

const ArcadeSpaceInvaders: React.FC<ArcadeSpaceInvadersProps> = (props: ArcadeSpaceInvadersProps) => {
  const { onBack } = props;
  return (
    <div style={{ padding: 24 }}>
      <button onClick={onBack} style={{ marginBottom: 16 }}>&larr; Back to Arcade</button>
      <SpaceInvaders />
    </div>
  );
};

export default ArcadeSpaceInvaders;
