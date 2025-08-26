import * as React from 'react';
import SlotMachine2 from '../ArcadeGames/SlotMachine2';

const ArcadeSlotMachine2: React.FC<{ userId: string; onBack: () => void }> = ({ userId, onBack }) => {
  return <SlotMachine2 userId={userId} onBack={onBack} />;
};

export default ArcadeSlotMachine2;
