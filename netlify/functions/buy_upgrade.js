const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event) {
  const { player_id, upgrade_id } = JSON.parse(event.body);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Get upgrade info and player upgrade quantity
  const { data: upgrade } = await supabase.from('upgrades').select('*').eq('upgrade_id', upgrade_id).single();
  const { data: pu } = await supabase.from('player_upgrades').select('*').eq('player_id', player_id).eq('upgrade_id', upgrade_id).single();

  const quantity = pu ? pu.quantity : 0;
  const cost = upgrade.base_cost * Math.pow(upgrade.cost_multiplier, quantity);

  // Get player ore_count
  const { data: player } = await supabase.from('players').select('ore_count').eq('player_id', player_id).single();
  if (player.ore_count < cost) return { statusCode: 400, body: JSON.stringify({ error: 'Not enough ore' }) };

  // Deduct cost and update quantity
  await supabase.from('players').update({ ore_count: player.ore_count - cost }).eq('player_id', player_id);
  if (pu) {
    await supabase.from('player_upgrades').update({ quantity: quantity + 1 }).eq('player_upgrade_id', pu.player_upgrade_id);
  } else {
    await supabase.from('player_upgrades').insert({ player_id, upgrade_id, quantity: 1 });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
