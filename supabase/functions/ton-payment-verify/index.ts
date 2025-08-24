// Supabase Edge Function: ton-payment-verify
// Verifies TON payment to RECEIVER_WALLET and returns confirmation
// POST { txHash: string, userId: string, amountTon: number }


// If running in Deno, ensure your editor supports Deno imports and enable Deno extension.
// If running in Node.js, use the following instead:
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Use URL import for TON client (Deno compatible)
// See: https://github.com/ton-community/ton/blob/main/packages/ton/src/index.ts
// If you need more, use: https://esm.sh/@ton/ton@0.0.1

const RECEIVER_WALLET = 'UQC9Vgi5erLMGVOHit2dQ5C1dww3XTV0OAvWOm3XhgVaVUI_';
const TON_API = 'https://toncenter.com/api/v2';
let TON_API_KEY = '88c5d1b06d51f91dd4548ded80f45c402d190746965cce3c1bf2f4a8c579523a';

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  try {
    const { txHash, userId, amountTon } = await req.json();
    if (!txHash || !userId || !amountTon) return new Response('Missing params', { status: 400 });

    // Query TON transaction details
    const url = `${TON_API}/getTransactions?address=${RECEIVER_WALLET}&limit=20&api_key=${TON_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.ok || !data.result) throw new Error('TON API error');

    // Find transaction by hash
    const tx = data.result.find((t: any) => t.transaction_id.hash === txHash);
    if (!tx) return new Response(JSON.stringify({ ok: false, reason: 'Transaction not found' }), { status: 404 });

    // Check amount and destination
    const amountNano = Math.floor(amountTon * 1e9).toString();
    if (tx.in_msg.value !== amountNano) {
      return new Response(JSON.stringify({ ok: false, reason: 'Amount mismatch' }), { status: 400 });
    }
    if (tx.in_msg.destination !== RECEIVER_WALLET) {
      return new Response(JSON.stringify({ ok: false, reason: 'Destination mismatch' }), { status: 400 });
    }

    // Mark payment as verified (optionally update Supabase DB here)
    return new Response(JSON.stringify({ ok: true, userId, txHash }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500 });
  }
});
