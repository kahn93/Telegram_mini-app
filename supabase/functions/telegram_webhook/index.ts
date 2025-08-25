// Supabase Edge Function: telegram_webhook
// Receives Telegram webhook updates and can send replies via Telegram Bot API
// Set your bot token here (for demo; use env var for production)


import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getUserBalance } from './gameLogic.ts';

const TELEGRAM_BOT_TOKEN = '7367415110:AAE_eLMMgvM9rERzsHlbYoxlm2apsiVsrHU';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  try {
    const update = await req.json();
    // Basic echo: reply to text messages
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text.trim();
      if (text === '/balance') {
        // Connect to game logic: fetch balance
        const balance = await getUserBalance(chatId);
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: `Your coin balance: ${balance}` })
        });
      } else {
        // Default: echo
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: `Echo: ${text}` })
        });
      }
    }
    // Respond 200 to Telegram
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500 });
  }
});
