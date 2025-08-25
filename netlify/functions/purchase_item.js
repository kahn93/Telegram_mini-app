const { createClient } = require('@supabase/supabase-js');
exports.handler = async function(event) {
  const { user_id, item_id } = JSON.parse(event.body);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  // Fetch item price, check user balance, update inventory and balance
  // ...
  return { statusCode: 200, body: JSON.stringify({ /* purchase result */ }) };
};
