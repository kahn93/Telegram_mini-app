// netlify/functions/send_mail.js
import { supabase } from '../../src/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { sender_id, recipient_id, subject, body } = req.body;
  if (!sender_id || !recipient_id || !subject || !body) return res.status(400).json({ error: 'Missing required fields' });
  const { data, error } = await supabase
    .from('mailbox')
    .insert([{ sender_id, recipient_id, subject, body, date_sent: new Date().toISOString(), is_read: false, is_claimed: false }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true, data });
}
