// netlify/functions/record_airdrop_transaction.js
import { supabase } from '../../src/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { user_id, ton_wallet_address, ton_transaction_hash, amount, status } = req.body;
  if (!user_id || !ton_wallet_address || !ton_transaction_hash || !amount || !status) return res.status(400).json({ error: 'Missing required fields' });
  const { data, error } = await supabase
    .from('airdrop_transactions')
    .insert([{ user_id, ton_wallet_address, ton_transaction_hash, amount, status, timestamp: new Date().toISOString() }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true, data });
}
