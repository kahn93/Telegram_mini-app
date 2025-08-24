// Simple in-memory leaderboard logic for each game
// In production, replace with backend or persistent storage

export interface LeaderboardEntry {
  name: string;
  score: number;
}

const MAX_ENTRIES = 10;

const leaderboards: Record<string, LeaderboardEntry[]> = {
  Pacman: [],
  Asteroids: [],
  Tetris: [],
  Plinko: [],
};

export function submitScore(game: string, name: string, score: number) {
  if (!leaderboards[game]) leaderboards[game] = [];
  leaderboards[game].push({ name, score });
  leaderboards[game] = leaderboards[game]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);
}

export function getLeaderboard(game: string): LeaderboardEntry[] {
  return leaderboards[game] || [];
}
