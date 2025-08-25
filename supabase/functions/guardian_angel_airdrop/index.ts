import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
serve(async (req) => {
  if (req.method === "POST") {
    const { user_id, wallet_address } = await req.json();
    // TODO: Validate eligibility, check if already claimed, interact with TON for LISA airdrop
    return new Response(JSON.stringify({ success: true, message: "Airdrop claimed!" }), { status: 200 });
  }
  return new Response("Method not allowed", { status: 405 });
});
