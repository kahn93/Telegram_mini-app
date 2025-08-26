// supabase/functions/update_leaderboard/index.ts
import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  const { leaderboard_id, user_id, metric_value, rank } = await req.json();
  if (!leaderboard_id || !user_id || metric_value == null || rank == null) return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await supabase.from('leaderboard_cache').upsert([{ leaderboard_id, user_id, metric_value, rank, last_updated: new Date().toISOString() }], { onConflict: 'leaderboard_id,user_id' });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
});
