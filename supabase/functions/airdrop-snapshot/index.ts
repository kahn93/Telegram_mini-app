// supabase/functions/airdrop-snapshot/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Fetch all users
  const { data: users, error: userError } = await supabase.from('users').select('userid, coins, ton_wallet')
  if (userError) return new Response('User fetch error: ' + userError.message, { status: 500 })

  // Helper to fetch count or sum from a table
  async function count(table: string, filter: any, sumField?: string) {
    if (sumField) {
      const { data, error } = await supabase.from(table).select(sumField).match(filter)
      if (error) return 0
      return data.reduce((acc: number, row: any) => acc + (row[sumField] || 0), 0)
    } else {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true }).match(filter)
      if (error) return 0
      return count || 0
    }
  }

  // Build player data
  let totalPoints = 0
  const players = []
  for (const user of users) {
    const upgrades = await count('upgrades', { userid: user.userid })
    const achievements = await count('achievements', { userid: user.userid, completed: true })
    const tasks = await count('tasks', { userid: user.userid, completed: true })
    const referrals = await count('referrals', { referrer_id: user.userid })
    const arcade = await count('arcade_scores', { userid: user.userid }, 'score')
    const checkins = await count('daily_checkins', { userid: user.userid })
    const purchases = await count('purchases', { userid: user.userid }, 'amount')
    const coinsEarned = user.coins || 0

    const points =
      coinsEarned * 0.001 +
      upgrades * 10 +
      achievements * 20 +
      tasks * 15 +
      referrals * 30 +
      arcade * 0.1 +
      checkins * 5 +
      purchases * 50

    totalPoints += points
    players.push({
      playerId: user.userid,
      tonWallet: user.ton_wallet,
      points,
      percentage: 0 // will be set below
    })
  }

  // Calculate percentages
  for (const player of players) {
    player.percentage = totalPoints > 0 ? (player.points / totalPoints) * 100 : 0
  }

  // Save snapshot
  const { error: insertError } = await supabase.from('airdrop_snapshots').insert([
    { snapshot_time: new Date().toISOString(), data: { timestamp: Date.now(), players } }
  ])
  if (insertError) return new Response('Snapshot insert error: ' + insertError.message, { status: 500 })

  return new Response('Airdrop snapshot created', { status: 200 })
})