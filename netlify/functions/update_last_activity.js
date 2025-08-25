const { createClient } = require('@supabase/supabase-js');
exports.handler = async function(event) {
  const { user_id } = JSON.parse(event.body);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabase.from('users').update({ last_activity_at: new Date().toISOString() }).eq('id', user_id);
  if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
