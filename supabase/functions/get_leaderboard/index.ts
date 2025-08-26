// supabase/functions/get_leaderboard/index.ts
import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  const { leaderboard_id } = await req.json();
  if (!leaderboard_id) return new Response(JSON.stringify({ error: 'Missing leaderboard_id' }), { status: 400 });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await supabase.from('leaderboard_cache').select('*').eq('leaderboard_id', leaderboard_id).order('rank', { ascending: true });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ leaderboard: data }), { status: 200 });
});
