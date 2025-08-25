import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const { player_id, upgrade_id } = await req.json();
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Get upgrade info and player upgrade quantity
  const { data: upgrade } = await supabase.from("upgrades").select("*").eq("upgrade_id", upgrade_id).single();
  const { data: pu } = await supabase.from("player_upgrades").select("*").eq("player_id", player_id).eq("upgrade_id", upgrade_id).single();

  const quantity = pu ? pu.quantity : 0;
  const cost = upgrade.base_cost * Math.pow(upgrade.cost_multiplier, quantity);

  // Get player ore_count
  const { data: player } = await supabase.from("players").select("ore_count").eq("player_id", player_id).single();
  if (player.ore_count < cost) return new Response(JSON.stringify({ error: "Not enough ore" }), { status: 400 });

  // Deduct cost and update quantity
  await supabase.from("players").update({ ore_count: player.ore_count - cost }).eq("player_id", player_id);
  if (pu) {
    await supabase.from("player_upgrades").update({ quantity: quantity + 1 }).eq("player_upgrade_id", pu.player_upgrade_id);
  } else {
    await supabase.from("player_upgrades").insert({ player_id, upgrade_id, quantity: 1 });
  }

  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
});
