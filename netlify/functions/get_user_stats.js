// netlify/functions/get_user_stats.js
import { supabase } from '../../src/supabaseClient.js';

export default async function handler(req, res) {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user_id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}
