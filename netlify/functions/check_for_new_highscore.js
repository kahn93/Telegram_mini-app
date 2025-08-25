const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event) {
  const { player_id, score } = JSON.parse(event.body);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Get lowest leaderboard score
  const { data: lowest } = await supabase
    .from('leaderboard')
    .select('score')
    .order('score', { ascending: true })
    .limit(1)
    .single();

  const { count } = await supabase
    .from('leaderboard')
    .select('*', { count: 'exact', head: true });

  let qualifies = false;
  if (count < 10 || score > (lowest ? lowest.score : 0)) {
    qualifies = true;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ qualifies })
  };
};
