const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event) {
  const { player_id } = JSON.parse(event.body);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: player } = await supabase.from('players').select('*').eq('player_id', player_id).single();
  const now = new Date();
  const last = new Date(player.last_login_time);
  const seconds = Math.floor((now.getTime() - last.getTime()) / 1000);

  // Get ores_per_second
  const { data: upgrades } = await supabase
    .from('player_upgrades')
    .select('quantity, upgrades(base_output, upgrade_type)')
    .eq('player_id', player_id);

  const ores_per_second = upgrades
    .filter(u => u.upgrades.upgrade_type === 'passive')
    .reduce((sum, u) => sum + u.quantity * u.upgrades.base_output, 0);

  const offline_gain = ores_per_second * seconds;
  const new_ore_count = player.ore_count + offline_gain;

  await supabase.from('players').update({ ore_count: new_ore_count, last_login_time: now.toISOString() }).eq('player_id', player_id);

  return {
    statusCode: 200,
    body: JSON.stringify({ offline_gain, ore_count: new_ore_count })
  };
};
