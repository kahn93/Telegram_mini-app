// netlify/functions/complete_task.js
import { supabase } from '../../src/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { user_id, task_id } = req.body;
  if (!user_id || !task_id) return res.status(400).json({ error: 'Missing user_id or task_id' });
  const { data, error } = await supabase
    .from('user_tasks')
    .upsert([{ user_id, task_id, is_completed: true, completion_date: new Date().toISOString() }], { onConflict: ['user_id', 'task_id'] });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true, data });
}
