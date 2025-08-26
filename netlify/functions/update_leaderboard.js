// netlify/functions/update_leaderboard.js
import { supabase } from '../../src/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { leaderboard_id, user_id, metric_value, rank } = req.body;
  if (!leaderboard_id || !user_id || metric_value == null || rank == null) return res.status(400).json({ error: 'Missing required fields' });
  const { data, error } = await supabase
    .from('leaderboard_cache')
    .upsert([{ leaderboard_id, user_id, metric_value, rank, last_updated: new Date().toISOString() }], { onConflict: ['leaderboard_id', 'user_id'] });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true, data });
}
