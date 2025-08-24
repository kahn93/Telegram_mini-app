import { supabase } from '../supabaseClient';

export interface LeaderboardEntry {
  name: string;
  score: number;
  game: string;
}

const SCORES_TABLE = 'arcade_scores';
const LEADERBOARD_VIEW = 'arcade_leaderboard';

// Save a new score for a user/game
export async function submitScoreSupabase(game: string, userid: string, score: number) {
  await supabase.from(SCORES_TABLE).insert([{ game, userid, score }]);
}

// Load leaderboard (top 10 per game, with userids)
export async function getLeaderboardSupabase(game: string): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from(LEADERBOARD_VIEW)
    .select('*')
    .eq('game', game)
    .order('score', { ascending: false })
    .limit(10);
  if (error) return [];
  // Optionally, join with users table to get display names
  return data as LeaderboardEntry[];
}
