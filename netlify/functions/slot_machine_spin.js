const { createClient } = require('@supabase/supabase-js');

// Symbol enums
const SYMBOLS = [
  'CHERRY', 'LEMON', 'BAR', 'DOUBLE_BAR', 'TRIPLE_BAR', 'SEVEN', 'WILD'
];

// Paylines
const PAYLINES = [
  [0, 0, 0], // Top row
  [1, 1, 1], // Middle row
  [2, 2, 2], // Bottom row
  [0, 1, 2], // Diagonal left-to-right
  [2, 1, 0]  // Diagonal right-to-left
];

// Payouts (tuple of symbol indices)
const PAYOUTS = {
  'SEVEN,SEVEN,SEVEN': 100,
  'TRIPLE_BAR,TRIPLE_BAR,TRIPLE_BAR': 50,
  'BAR,BAR,BAR': 25,
  'CHERRY,CHERRY,CHERRY': 10,
  'CHERRY,CHERRY,ANY': 5,
  'WILD,WILD,WILD': 200
};

function getRandomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function evaluatePayline(symbols) {
  const key = symbols.join(',');
  if (PAYOUTS[key]) return PAYOUTS[key];
  // Special case: CHERRY,CHERRY,ANY
  if (symbols[0] === 'CHERRY' && symbols[1] === 'CHERRY') return PAYOUTS['CHERRY,CHERRY,ANY'];
  return 0;
}

exports.handler = async function(event) {
  const { player_id, current_bet } = JSON.parse(event.body);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Get player balance
  const { data: player } = await supabase.from('players').select('player_id, balance').eq('player_id', player_id).single();
  if (!player || player.balance < current_bet) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Insufficient balance' }) };
  }

  // Deduct bet
  await supabase.from('players').update({ balance: player.balance - current_bet }).eq('player_id', player_id);

  // Spin reels
  const reel_stops = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

  // Evaluate paylines
  let last_win_amount = 0;
  for (const payline of PAYLINES) {
    const symbols = payline.map((row, i) => reel_stops[i]);
    last_win_amount += evaluatePayline(symbols);
  }
  last_win_amount *= current_bet;

  // Award payout
  if (last_win_amount > 0) {
    await supabase.from('players').update({ balance: player.balance - current_bet + last_win_amount }).eq('player_id', player_id);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      reel_stops,
      last_win_amount,
      new_balance: player.balance - current_bet + last_win_amount
    })
  };
};
