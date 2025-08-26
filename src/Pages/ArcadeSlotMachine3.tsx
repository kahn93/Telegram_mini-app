import * as React from 'react';
import SlotMachine3 from '../ArcadeGames/SlotMachine3';

const ArcadeSlotMachine3: React.FC<{ userId: string; onBack: () => void }> = ({ userId, onBack }) => {
  return <SlotMachine3 userId={userId} onBack={onBack} />;
};

export default ArcadeSlotMachine3;
