// Minimal Express server for Render backend

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';


const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);


// Health check
app.get('/', (req, res) => {
  res.send('Backend is running!');
});



// Telegram Bot Webhook
app.post('/webhook/telegram', async (req, res) => {
  const update = req.body;
  // Example: handle /balance command
  if (update.message && update.message.text === '/balance') {
    const userId = update.message.from.id;
    // Fetch user balance from Supabase
    const { data } = await supabase.from('users').select('coins').eq('userid', userId).single();
    // Respond to Telegram
    await fetch(`https://api.telegram.org/bot${process.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: userId,
        text: data ? `Your balance: ${data.coins}` : 'User not found.'
      })
    });
  }
  res.status(200).json({ ok: true });
});


// TON Payment Webhook
app.post('/webhook/ton', async (req, res) => {
  const payment = req.body;
  // Example: update user balance on payment
  if (payment && payment.userId && payment.amount) {
    await supabase.from('users').update({ coins: payment.amount }).eq('userid', payment.userId);
  }
  res.status(200).json({ ok: true });
});


// Supabase Edge Function Webhook (for DB events)
app.post('/webhook/supabase', async (req, res) => {
  const event = req.body;
  // Example: log event
  await supabase.from('event_logs').insert([{ event_type: event.type, payload: event }]);
  res.status(200).json({ ok: true });
});


// Analytics/Referral Webhook
app.post('/webhook/analytics', async (req, res) => {
  const analytics = req.body;
  // Example: log analytics event
  await supabase.from('analytics').insert([analytics]);
  res.status(200).json({ ok: true });
});


// Anti-Cheat Webhook
app.post('/webhook/anticheat', async (req, res) => {
  const report = req.body;
  // Example: log anti-cheat report
  await supabase.from('anticheat_reports').insert([report]);
  res.status(200).json({ ok: true });
});


// NFT Mint/Transfer Webhook
app.post('/webhook/nft', async (req, res) => {
  const nftEvent = req.body;
  // Example: update NFT ownership
  if (nftEvent && nftEvent.nft_id && nftEvent.userid) {
    await supabase.from('nfts').update({ userid: nftEvent.userid }).eq('nft_id', nftEvent.nft_id);
  }
  res.status(200).json({ ok: true });
});


// Third-Party Notification Webhook (e.g., Discord, Slack)
app.post('/webhook/notify', async (req, res) => {
  const notification = req.body;
  // Example: send to Slack webhook
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: notification.message })
    });
  }
  res.status(200).json({ ok: true });
});

// Example endpoint for your game (expand as needed)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
