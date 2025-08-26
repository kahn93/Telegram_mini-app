// supabase/functions/spin_slot/index.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  const { user_id, game_id, bet_amount, reel_results } = await req.json();
  if (!user_id || !game_id || !bet_amount || !reel_results) return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await supabase.from('spin_logs').insert([{ user_id, game_id, bet_amount, win_amount: 0, win_status: false, reel_results, timestamp: new Date().toISOString() }]);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
});
