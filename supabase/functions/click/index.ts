import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const { player_id } = await req.json();
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Get ores_per_click
  const { data: upgrades } = await supabase
    .from("player_upgrades")
    .select("quantity, upgrades(base_output, upgrade_type)")
    .eq("player_id", player_id);

  const ores_per_click = upgrades
    .filter((u: any) => u.upgrades.upgrade_type === "click")
    .reduce((sum: number, u: any) => sum + u.quantity * u.upgrades.base_output, 0);

  // Update ore_count
  const { data: player } = await supabase
    .from("players")
    .select("ore_count")
    .eq("player_id", player_id)
    .single();

  const new_ore_count = player.ore_count + ores_per_click;

  await supabase
    .from("players")
    .update({ ore_count: new_ore_count })
    .eq("player_id", player_id);

  return new Response(JSON.stringify({ ore_count: new_ore_count }), { headers: { "Content-Type": "application/json" } });
});
