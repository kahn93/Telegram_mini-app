import React, { useEffect, useState } from 'react';
import { getLeaderboardSupabase, LeaderboardEntry } from './leaderboardSupabase';

const LeaderboardMini: React.FC<{ game: string }> = ({ game }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  useEffect(() => {
    getLeaderboardSupabase(game).then(setLeaderboard);
    const interval = setInterval(() => getLeaderboardSupabase(game).then(setLeaderboard), 5000);
    return () => clearInterval(interval);
  }, [game]);
  return (
    <div style={{ background: '#222', borderRadius: 8, padding: 8, margin: '8px 0', color: '#fff', minWidth: 180 }}>
      <b>{game} Top 10</b>
      <ol style={{ margin: 0, paddingLeft: 18 }}>
        {leaderboard.length === 0 && <li style={{ color: '#888' }}>No scores yet</li>}
        {leaderboard.map((entry, i) => (
          <li key={i}>
            {entry.name}: {entry.score}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default LeaderboardMini;
