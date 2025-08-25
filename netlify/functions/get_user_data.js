const { createClient } = require('@supabase/supabase-js');
exports.handler = async function(event) {
  const { user_id } = JSON.parse(event.body);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.from('users').select('*').eq('id', user_id).single();
  if (error) return { statusCode: 404, body: JSON.stringify({ error: error.message }) };
  return { statusCode: 200, body: JSON.stringify(data) };
};
