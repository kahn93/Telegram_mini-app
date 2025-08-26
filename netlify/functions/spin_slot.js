// netlify/functions/spin_slot.js
import { supabase } from '../../src/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { user_id, game_id, bet_amount, reel_results } = req.body;
  if (!user_id || !game_id || !bet_amount || !reel_results) return res.status(400).json({ error: 'Missing required fields' });
  // Insert spin log
  const { data, error } = await supabase
    .from('spin_logs')
    .insert([{ user_id, game_id, bet_amount, win_amount: 0, win_status: false, reel_results, timestamp: new Date().toISOString() }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true, data });
}
