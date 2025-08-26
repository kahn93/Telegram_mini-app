// netlify/functions/get_tasks.js
import { supabase } from '../../src/supabaseClient.js';

export default async function handler(req, res) {
  const { user_id } = req.query;
  let query = supabase.from('tasks').select('*');
  if (user_id) {
    query = query.in('task_id', supabase.from('user_tasks').select('task_id').eq('user_id', user_id));
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ tasks: data });
}
