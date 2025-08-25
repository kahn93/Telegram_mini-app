const { createClient } = require('@supabase/supabase-js');
exports.handler = async function(event) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  // Query leaderboard data
  // ...
  return { statusCode: 200, body: JSON.stringify({ /* leaderboard */ }) };
};
