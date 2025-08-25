const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event) {
  const { player_id, score } = JSON.parse(event.body);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Insert game session
  const { data: game, error } = await supabase
    .from('games')
    .insert([{ player_id, score }])
    .select()
    .single();

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  // Optionally, check for new high score (leaderboard is updated by DB trigger)
  return {
    statusCode: 200,
    body: JSON.stringify({ game_id: game.game_id, score: game.score })
  };
};
