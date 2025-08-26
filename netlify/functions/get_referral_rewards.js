// netlify/functions/get_referral_rewards.js
import { supabase } from '../../src/supabaseClient.js';

export default async function handler(req, res) {
  const { data, error } = await supabase.from('referral_rewards').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ referral_rewards: data });
}
