// netlify/functions/log_referral.js
import { supabase } from '../../src/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { referrer_id, referred_user_id } = req.body;
  if (!referrer_id || !referred_user_id) return res.status(400).json({ error: 'Missing referrer_id or referred_user_id' });
  const { data, error } = await supabase
    .from('referral_logs')
    .insert([{ referrer_id, referred_user_id, timestamp: new Date().toISOString(), is_reward_paid: false }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true, data });
}
