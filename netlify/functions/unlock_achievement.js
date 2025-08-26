// netlify/functions/unlock_achievement.js
import { supabase } from '../../src/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { user_id, achievement_id } = req.body;
  if (!user_id || !achievement_id) return res.status(400).json({ error: 'Missing user_id or achievement_id' });
  const { data, error } = await supabase
    .from('user_achievements')
    .insert([{ user_id, achievement_id, date_unlocked: new Date().toISOString() }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true, data });
}
