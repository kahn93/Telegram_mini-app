import React from 'react';
import Tetris from '../ArcadeGames/Tetris';
import LeaderboardMini from '../ArcadeGames/LeaderboardMini';

const ArcadeTetris: React.FC<{ onBack: () => void; playerName: string }> = ({ onBack, playerName }) => {
  const [submitError, setSubmitError] = React.useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <button onClick={onBack} style={{ alignSelf: 'flex-start', margin: 8 }}>← Back to Arcade</button>
      <Tetris onScore={async score => {
        if (score > 0) {
          try {
            const mod = await import('../ArcadeGames/leaderboardSupabase');
            await mod.submitScoreSupabase('Tetris', playerName, score);
            setSubmitError('');
          } catch (e: unknown) {
            let msg = 'Failed to submit score.';
            if (typeof e === 'object' && e && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
              msg += `\n${(e as { message: string }).message}`;
            }
            setSubmitError(msg);
          }
        }
      }} />
      {submitError && <div style={{ color: '#ff4d4f', fontWeight: 600, marginTop: 4 }}>{submitError}</div>}
      <LeaderboardMini game="Tetris" />
    </div>
  );
};

export default ArcadeTetris;
