// supabase/functions/analytics/index.ts
// Edge Function for analytics event logging
import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  // Parse event payload
  const { userid, event, details } = await req.json();
  if (!userid || !event) {
    return new Response(JSON.stringify({ error: 'Missing userid or event' }), { status: 400 });
  }

  // Supabase client (service role key required for Edge Functions)
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // Insert event into analytics_events table
  const { error } = await supabase.from('analytics_events').insert({
    userid,
    event,
    details,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
