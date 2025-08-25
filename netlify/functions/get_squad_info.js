const { createClient } = require('@supabase/supabase-js');
exports.handler = async function(event) {
  const { squad_id } = JSON.parse(event.body);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  // Fetch squad info, members, stats
  // ...
  return { statusCode: 200, body: JSON.stringify({ /* squad info */ }) };
};
