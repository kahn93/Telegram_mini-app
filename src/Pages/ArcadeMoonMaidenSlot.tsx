import * as React from 'react';
import MoonMaidenSlot from '../ArcadeGames/MoonMaidenSlot';

const ArcadeMoonMaidenSlot: React.FC<{ userId: string; onBack: () => void }> = ({ userId, onBack }) => {
  return <MoonMaidenSlot userId={userId} onBack={onBack} />;
};

export default ArcadeMoonMaidenSlot;
