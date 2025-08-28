// Standalone airdrop metrics logic for Netlify function
// This file is self-contained and does not import from src/

import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  // Support both Netlify (process.env) and Vite (import.meta.env) environments
  const env = (typeof process !== 'undefined' && typeof process.env !== 'undefined')
    ? process.env
    : (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined'
      ? import.meta.env
      : {});
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseAnonKey);
}

async function getPlayerMetrics(playerId) {
  const supabase = getSupabaseClient();
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

export { getPlayerMetrics };
