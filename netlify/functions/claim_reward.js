// netlify/functions/claim_reward.js
import { supabase } from '../../src/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { user_id, reward_id } = req.body;
  if (!user_id || !reward_id) return res.status(400).json({ error: 'Missing user_id or reward_id' });
  // Insert claim
  const { data, error } = await supabase
    .from('user_rewards')
    .insert([{ user_id, reward_id, claim_date: new Date().toISOString() }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true, data });
}
