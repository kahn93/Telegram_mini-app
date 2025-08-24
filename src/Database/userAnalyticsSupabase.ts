import { supabase } from '../supabaseClient';

export async function getUserAnalytics(userid: string) {
  // Total coins earned
  const { data: coinsData } = await supabase
    .from('analytics_events')
    .select('details')
    .eq('userid', userid)
    .eq('event', 'coin_earned');
  const totalCoins = coinsData?.reduce((sum, ev) => sum + (ev.details?.amount || 0), 0) || 0;

  // Games played
  const { count: gamesPlayed } = await supabase
    .from('arcade_scores')
    .select('id', { count: 'exact', head: true })
    .eq('userid', userid);

  // Referrals
  const { count: referrals } = await supabase
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', userid);

  // Achievements
  const { count: achievements } = await supabase
    .from('achievements')
    .select('id', { count: 'exact', head: true })
    .eq('userid', userid)
    .eq('completed', true);

  // NFTs
  const { count: nfts } = await supabase
    .from('nfts')
    .select('id', { count: 'exact', head: true })
    .eq('userid', userid);

  return {
    totalCoins,
    gamesPlayed: gamesPlayed || 0,
    referrals: referrals || 0,
    achievements: achievements || 0,
    nfts: nfts || 0,
  };
}
