// netlify/functions/get_mailbox.js
import { supabase } from '../../src/supabaseClient.js';

export default async function handler(req, res) {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });
  const { data, error } = await supabase
    .from('mailbox')
    .select('*')
    .eq('recipient_id', user_id)
    .order('date_sent', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ mailbox: data });
}
