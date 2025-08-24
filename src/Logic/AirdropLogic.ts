import { getAllUsersSupabase } from '../Database/dbSupabase';
import { supabase } from '../supabaseClient';

export interface AirdropPlayer {
  playerId: string;
  tonWallet: string;
  points: number;
  percentage: number;
}

export interface AirdropSnapshot {
  timestamp: number;
  players: AirdropPlayer[];
}

// Fetch all player metrics from Supabase
async function getPlayerMetrics(playerId: string) {
  try {
    // Coins and wallet
    const { data: user, error: userError } = await supabase.from('users').select('coins, ton_wallet').eq('userid', playerId).single();
    if (userError) throw userError;
    // Upgrades
    const { count: upgrades, error: upgradesError } = await supabase.from('upgrades').select('*', { count: 'exact', head: true }).eq('userid', playerId);
    if (upgradesError) throw upgradesError;
    // Achievements (completed)
    const { count: achievements, error: achievementsError } = await supabase.from('achievements').select('*', { count: 'exact', head: true }).eq('userid', playerId).eq('completed', true);
    if (achievementsError) throw achievementsError;
    // Tasks (completed)
    const { count: tasks, error: tasksError } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('userid', playerId).eq('completed', true);
    if (tasksError) throw tasksError;
    // Referrals
    const { count: referrals, error: referralsError } = await supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', playerId);
    if (referralsError) throw referralsError;
    // Arcade scores (sum)
    const { data: arcadeRows, error: arcadeError } = await supabase.from('arcade_scores').select('score').eq('userid', playerId);
    if (arcadeError) throw arcadeError;
    const arcade = arcadeRows ? arcadeRows.reduce((sum, row) => sum + (row.score || 0), 0) : 0;
    // Daily check-ins
    const { count: checkins, error: checkinsError } = await supabase.from('daily_checkins').select('*', { count: 'exact', head: true }).eq('userid', playerId);
    if (checkinsError) throw checkinsError;
    // Purchases (sum)
    const { data: purchaseRows, error: purchasesError } = await supabase.from('purchases').select('amount').eq('userid', playerId);
    if (purchasesError) throw purchasesError;
    const purchases = purchaseRows ? purchaseRows.reduce((sum, row) => sum + (row.amount || 0), 0) : 0;
    return {
      coinsEarned: user?.coins || 0,
      upgrades: upgrades || 0,
      achievements: achievements || 0,
      tasks: tasks || 0,
      referrals: referrals || 0,
      arcade,
      checkins: checkins || 0,
      purchases,
      tonWallet: user?.ton_wallet || '',
    };
  } catch (err) {
    console.error('Airdrop metric fetch error for', playerId, err);
    return {
      coinsEarned: 0,
      upgrades: 0,
      achievements: 0,
      tasks: 0,
      referrals: 0,
      arcade: 0,
      checkins: 0,
      purchases: 0,
      tonWallet: '',
    };
  }
}

// Calculate points for a player
function calculatePoints(metrics: ReturnType<typeof getPlayerMetrics> extends Promise<infer T> ? T : never) {
  // You can adjust these weights as needed
  return (
    metrics.coinsEarned * 0.001 +
    metrics.upgrades * 10 +
    metrics.achievements * 20 +
    metrics.tasks * 15 +
    metrics.referrals * 30 +
    metrics.arcade * 0.1 +
    metrics.checkins * 5 +
    metrics.purchases * 50
  );
}

// Main logic: calculate all player points and percentages
export async function calculateAirdropSnapshot(): Promise<AirdropSnapshot> {
  const users = await getAllUsersSupabase();
  const playerData: AirdropPlayer[] = [];
  let totalPoints = 0;

  for (const user of users) {
    const metrics = await getPlayerMetrics(user.userid);
    const points = calculatePoints(metrics);
    totalPoints += points;
    playerData.push({
      playerId: user.userid,
      tonWallet: metrics.tonWallet,
      points,
      percentage: 0, // will be set below
    });
  }

  // Calculate percentages
  for (const player of playerData) {
    player.percentage = totalPoints > 0 ? (player.points / totalPoints) * 100 : 0;
  }

  // Save to airdrop_snapshots table in Supabase
  const snapshot = { timestamp: Date.now(), players: playerData };
  const { error } = await supabase.from('airdrop_snapshots').insert([{ snapshot_time: new Date(), data: snapshot }]);
  if (error) {
    console.error('Airdrop snapshot save error:', error);
  }
  return snapshot;
}

// (No longer needed) Save snapshot to file
// async function saveAirdropSnapshot(snapshot: AirdropSnapshot) {}

// Periodic trigger (Node.js/Server only)
export function startAirdropBackgroundJob(intervalMs = 60 * 60 * 1000) {
  setInterval(() => {
    calculateAirdropSnapshot();
  }, intervalMs);
}
