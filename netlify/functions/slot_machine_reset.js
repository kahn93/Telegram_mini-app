const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event) {
  const { player_id, starting_balance } = JSON.parse(event.body);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Reset player balance
  const { error } = await supabase
    .from('players')
    .update({ balance: starting_balance || 1000 })
    .eq('player_id', player_id);

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ new_balance: starting_balance || 1000 })
  };
};
