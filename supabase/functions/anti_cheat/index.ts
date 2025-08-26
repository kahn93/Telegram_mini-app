// If you are running this in Deno, add the following comment to enable type checking for the remote module:
/// <reference types="https://deno.land/std@0.203.0/http/server.ts" />
import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

// Edge function for anti-cheat logic
serve(async (req) => {
  const { user, action, context } = await req.json()
  // Example anti-cheat: block duplicate claims within 1 minute
  if (action === 'claim_airdrop') {
    // Connect to Supabase
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
    const { data, error } = await supabase
      .from('analytics_events')
      .select('created_at')
      .eq('user_id', user)
      .eq('event', 'claim_airdrop')
      .order('created_at', { ascending: false })
      .limit(1)
    if (data && data.length > 0) {
      const lastClaim = new Date(data[0].created_at)
      if (Date.now() - lastClaim.getTime() < 60000) {
        return new Response(JSON.stringify({ error: 'Too soon' }), { status: 429 })
      }
    }
  }
  // Add more anti-cheat logic as needed
  return new Response(JSON.stringify({ success: true }))
})
