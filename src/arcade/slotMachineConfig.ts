// Enums for game state and symbols
export enum GameState {
  IDLE = 'GAME_STATE_IDLE',
  SPINNING = 'GAME_STATE_SPINNING',
  EVALUATING = 'GAME_STATE_EVALUATING',
  PAYOUT = 'GAME_STATE_PAYOUT',
  GAME_OVER = 'GAME_STATE_GAME_OVER',
}

export enum SymbolType {
  CHERRY = 'SYMBOL_CHERRY',
  LEMON = 'SYMBOL_LEMON',
  BAR = 'SYMBOL_BAR',
  DOUBLE_BAR = 'SYMBOL_DOUBLE_BAR',
  TRIPLE_BAR = 'SYMBOL_TRIPLE_BAR',
  SEVEN = 'SYMBOL_SEVEN',
  WILD = 'SYMBOL_WILD',
}

// Paylines
export const PAYLINES: number[][] = [
  [0, 0, 0], // Top row
  [1, 1, 1], // Middle row
  [2, 2, 2], // Bottom row
  [0, 1, 2], // Diagonal left-to-right
  [2, 1, 0], // Diagonal right-to-left
];

// Payouts
export const PAYOUTS: Record<string, number> = {
  'SYMBOL_SEVEN,SYMBOL_SEVEN,SYMBOL_SEVEN': 100,
  'SYMBOL_TRIPLE_BAR,SYMBOL_TRIPLE_BAR,SYMBOL_TRIPLE_BAR': 50,
  'SYMBOL_BAR,SYMBOL_BAR,SYMBOL_BAR': 25,
  'SYMBOL_CHERRY,SYMBOL_CHERRY,SYMBOL_CHERRY': 10,
  'SYMBOL_CHERRY,SYMBOL_CHERRY,ANY': 5,
  'SYMBOL_WILD,SYMBOL_WILD,SYMBOL_WILD': 200,
};

export const SYMBOLS: SymbolType[] = [
  SymbolType.CHERRY,
  SymbolType.LEMON,
  SymbolType.BAR,
  SymbolType.DOUBLE_BAR,
  SymbolType.TRIPLE_BAR,
  SymbolType.SEVEN,
  SymbolType.WILD,
];
