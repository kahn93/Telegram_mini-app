const { createClient } = require('@supabase/supabase-js');
exports.handler = async function(event) {
  const { user_id, squad_id } = JSON.parse(event.body);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  // Validate eligibility, update user and squad rewards
  // ...
  return { statusCode: 200, body: JSON.stringify({ /* reward result */ }) };
};
