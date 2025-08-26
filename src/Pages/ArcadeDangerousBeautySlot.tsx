import * as React from 'react';
import DangerousBeautySlot from '../ArcadeGames/DangerousBeautySlot';

const ArcadeDangerousBeautySlot: React.FC<{ userId: string; onBack: () => void }> = ({ userId, onBack }) => {
  return <DangerousBeautySlot userId={userId} onBack={onBack} />;
};

export default ArcadeDangerousBeautySlot;
