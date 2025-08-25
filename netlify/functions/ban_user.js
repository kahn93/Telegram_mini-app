const { createClient } = require('@supabase/supabase-js');
exports.handler = async function(event) {
  const { user_id } = JSON.parse(event.body);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  await supabase.from('users').update({ player_status: 'banned' }).eq('id', user_id);
  await supabase.from('anti_cheat_logs').insert([{ user_id, reason: 'manual ban', timestamp: new Date().toISOString() }]);
  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
