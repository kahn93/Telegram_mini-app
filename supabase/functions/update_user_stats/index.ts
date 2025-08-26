// supabase/functions/update_user_stats/index.ts
import { serve } from 'https://deno.land/std@0.203.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  const { user_id, ...fields } = await req.json();
  if (!user_id) return new Response(JSON.stringify({ error: 'Missing user_id' }), { status: 400 });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await supabase.from('user_stats').update(fields).eq('user_id', user_id).single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
});
