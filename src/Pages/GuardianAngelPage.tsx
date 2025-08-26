import * as React from 'react';
import GuardianAngel from '../ArcadeGames/GuardianAngel';

const GuardianAngelPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #ffe259 0%, #23234a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <GuardianAngel />
    </div>
  );
};

export default GuardianAngelPage;
