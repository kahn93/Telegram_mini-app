import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
serve(async (req) => {
  if (req.method === "POST") {
    const { user_id, tx_hash, amount, jetton } = await req.json();
    // TODO: Verify payment on TON blockchain, update user balance, log transaction
    return new Response(JSON.stringify({ success: true, verified: true }), { status: 200 });
  }
  return new Response("Method not allowed", { status: 405 });
});
