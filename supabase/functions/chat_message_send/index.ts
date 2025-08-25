import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
serve(async (req) => {
  if (req.method === "POST") {
    const { user_id, message } = await req.json();
    // TODO: Save chat message, moderate if needed
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }
  return new Response("Method not allowed", { status: 405 });
});
