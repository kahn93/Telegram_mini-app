const { createClient } = require('@supabase/supabase-js');
exports.handler = async function(event) {
  const { user_id } = JSON.parse(event.body);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  // Calculate refill based on last_activity_at, update users.current_energy
  // ...
  return { statusCode: 200, body: JSON.stringify({ /* new energy */ }) };
};
