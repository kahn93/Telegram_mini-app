// Supabase Edge Function: ton-withdraw
// Handles TON withdrawal requests: sends TON to user and debits coins
// POST { userId: string, withdrawAddress: string, coinAmount: number, tonAmount: number }


import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RECEIVER_WALLET = 'UQC9Vgi5erLMGVOHit2dQ5C1dww3XTV0OAvWOm3XhgVaVUI_';
const TON_API = 'https://toncenter.com/api/v2';
const TON_API_KEY = '88c5d1b06d51f91dd4548ded80f45c402d190746965cce3c1bf2f4a8c579523a';

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  try {
    const { userId, withdrawAddress, coinAmount, tonAmount } = await req.json();
    if (!userId || !withdrawAddress || !coinAmount || !tonAmount) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing params' }), { status: 400 });
    }

    // 1. (Demo) Mark withdrawal as requested in Supabase (not implemented here)
    // 2. (Demo) In production, trigger a secure backend to send TON from RECEIVER_WALLET to withdrawAddress
    // 3. (Demo) Debit coins from user in Supabase (not implemented here)

    // Respond as if successful
    return new Response(JSON.stringify({ ok: true, userId, withdrawAddress, tonAmount }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500 });
  }
});
