// netlify/functions/log_gameplay.js
import { supabase } from '../../src/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { user_id, event_type, event_data } = req.body;
  if (!user_id || !event_type) return res.status(400).json({ error: 'Missing user_id or event_type' });
  const { data, error } = await supabase
    .from('gameplay_logs')
    .insert([{ user_id, event_type, event_data, timestamp: new Date().toISOString() }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true, data });
}
