const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event) {
  const { player_id } = JSON.parse(event.body);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Get ores_per_click
  const { data: upgrades } = await supabase
    .from('player_upgrades')
    .select('quantity, upgrades(base_output, upgrade_type)')
    .eq('player_id', player_id);

  const ores_per_click = upgrades
    .filter(u => u.upgrades.upgrade_type === 'click')
    .reduce((sum, u) => sum + u.quantity * u.upgrades.base_output, 0);

  // Update ore_count
  const { data: player } = await supabase
    .from('players')
    .select('ore_count')
    .eq('player_id', player_id)
    .single();

  const new_ore_count = player.ore_count + ores_per_click;

  await supabase
    .from('players')
    .update({ ore_count: new_ore_count })
    .eq('player_id', player_id);

  return {
    statusCode: 200,
    body: JSON.stringify({ ore_count: new_ore_count })
  };
};
