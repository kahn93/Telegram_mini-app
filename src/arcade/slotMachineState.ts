import { GameState, SymbolType, PAYLINES, PAYOUTS, SYMBOLS } from './slotMachineConfig';

export interface SlotMachineState {
  player_balance: number;
  current_bet: number;
  reel_stops: SymbolType[];
  spin_in_progress: boolean;
  last_win_amount: number;
  game_state: GameState;
}

export function getInitialSlotMachineState(startingBalance = 1000): SlotMachineState {
  return {
    player_balance: startingBalance,
    current_bet: 10,
    reel_stops: [SymbolType.CHERRY, SymbolType.CHERRY, SymbolType.CHERRY],
    spin_in_progress: false,
    last_win_amount: 0,
    game_state: GameState.IDLE,
  };
}

export function spin(state: SlotMachineState): SlotMachineState {
  if (state.spin_in_progress || state.player_balance < state.current_bet) {
    return { ...state, game_state: state.player_balance < state.current_bet ? GameState.GAME_OVER : state.game_state };
  }
  const newReels = [
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
  ];
  return {
    ...state,
    player_balance: state.player_balance - state.current_bet,
    reel_stops: newReels,
    spin_in_progress: true,
    game_state: GameState.SPINNING,
  };
}

export function evaluate_results(state: SlotMachineState): SlotMachineState {
  let win = 0;
  for (const payline of PAYLINES) {
    const symbols = payline.map((row, i) => state.reel_stops[i]);
    const key = symbols.join(',');
    if (PAYOUTS[key]) win += PAYOUTS[key];
    // Special case: CHERRY,CHERRY,ANY
    if (symbols[0] === SymbolType.CHERRY && symbols[1] === SymbolType.CHERRY) win += PAYOUTS['SYMBOL_CHERRY,SYMBOL_CHERRY,ANY'] || 0;
  }
  win *= state.current_bet;
  return {
    ...state,
    last_win_amount: win,
    game_state: GameState.EVALUATING,
  };
}

export function award_payout(state: SlotMachineState): SlotMachineState {
  const newBalance = state.player_balance + state.last_win_amount;
  return {
    ...state,
    player_balance: newBalance,
    last_win_amount: 0,
    spin_in_progress: false,
    game_state: newBalance === 0 ? GameState.GAME_OVER : GameState.PAYOUT,
  };
}

export function reset_game(startingBalance = 1000): SlotMachineState {
  return getInitialSlotMachineState(startingBalance);
}
