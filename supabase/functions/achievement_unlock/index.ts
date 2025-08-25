import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
serve(async (req) => {
  if (req.method === "POST") {
    const { user_id, achievement_type } = await req.json();
    // TODO: Unlock achievement, update user, log
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }
  return new Response("Method not allowed", { status: 405 });
});
