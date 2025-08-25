const { createClient } = require('@supabase/supabase-js');
exports.handler = async function(event) {
  const { user_id } = JSON.parse(event.body);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  // Calculate passive income, update users.current_balance, update last_claimed_at
  // ...
  return { statusCode: 200, body: JSON.stringify({ /* new balance */ }) };
};
