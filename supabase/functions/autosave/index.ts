// Supabase Edge Function: autosave
// Handles auto-save and auto-load of user game state and coin balance
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method === "POST") {
    const { user_id, data, type } = await req.json();
    // type: 'save' or 'load'
    if (!user_id || !type) {
      return new Response(JSON.stringify({ error: "Missing user_id or type" }), { status: 400 });
    }

    // Save game state
    if (type === "save") {
      // Save to autosave_logs
      const { error } = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/autosave_logs`, {
        method: "POST",
        headers: {
          "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user_id, data, type: "save" })
      });
      if (error) {
        return new Response(JSON.stringify({ error: "Failed to save" }), { status: 500 });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // Load game state
    if (type === "load") {
      const resp = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/autosave_logs?user_id=eq.${user_id}&type=eq.save&order=created_at.desc&limit=1`, {
        headers: {
          "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
        }
      });
      const logs = await resp.json();
      if (!logs.length) {
        return new Response(JSON.stringify({ error: "No save found" }), { status: 404 });
      }
      return new Response(JSON.stringify({ data: logs[0].data }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400 });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
});
