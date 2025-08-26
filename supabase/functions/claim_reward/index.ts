// supabase/functions/claim_reward/index.ts
import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  const { user_id, reward_id } = await req.json();
  if (!user_id || !reward_id) return new Response(JSON.stringify({ error: 'Missing user_id or reward_id' }), { status: 400 });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await supabase.from('user_rewards').insert([{ user_id, reward_id, claim_date: new Date().toISOString() }]);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
});
