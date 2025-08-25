const { createClient } = require('@supabase/supabase-js');
exports.handler = async function(event) {
  const { user_id, squad_id } = JSON.parse(event.body);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  // Remove user from squad, update squad members
  // ...
  return { statusCode: 200, body: JSON.stringify({ /* squad leave result */ }) };
};
