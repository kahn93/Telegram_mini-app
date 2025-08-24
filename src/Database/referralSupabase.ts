import { supabase } from '../supabaseClient';

export async function getOrCreateReferralCode(userid: string): Promise<string> {
  // Try to get existing code
  const { data } = await supabase
    .from('users')
    .select('referral_code')
    .eq('userid', userid)
    .single();
  if (data && data.referral_code) return data.referral_code;
  // Generate new code
  const code = Math.random().toString(36).substring(2, 10);
  await supabase.from('users').update({ referral_code: code }).eq('userid', userid);
  return code;
}

export async function getUserByReferralCode(code: string) {
  const { data } = await supabase.from('users').select('*').eq('referral_code', code).single();
  return data;
}

export async function addReferral(referrerId: string, referredId: string, parentReferralId?: number, level: number = 1) {
  await supabase.from('referrals').insert([
    {
      referrer_id: referrerId,
      referred_id: referredId,
      parent_referral_id: parentReferralId || null,
      referral_level: level,
    },
  ]);
}

export async function getReferralLeaderboard() {
  const { data } = await supabase.from('referral_leaderboard').select('*').order('direct_referrals', { ascending: false });
  return data || [];
}
