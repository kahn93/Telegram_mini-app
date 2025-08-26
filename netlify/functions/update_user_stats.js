// netlify/functions/update_user_stats.js
import { supabase } from '../../src/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { user_id, ...fields } = req.body;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });
  const { data, error } = await supabase
    .from('user_stats')
    .update(fields)
    .eq('user_id', user_id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}
