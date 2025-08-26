import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
serve(async (req) => {
  if (req.method === "POST") {
    const { user_id, nft_data } = await req.json();
    // TODO: Mint NFT, save to DB, interact with TON if needed
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }
  return new Response("Method not allowed", { status: 405 });
});
