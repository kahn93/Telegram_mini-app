// 12. Analytics event log
export async function analyticsEventLog(payload: { userid: string; event: string; details?: Record<string, unknown> }) {
  return callEdgeFunction('analytics', payload);
}
// Utility for calling Supabase Edge Functions from the frontend

import { supabase } from '../supabaseClient';

// Generic Edge Function caller
export async function callEdgeFunction<T = any, R = any>(functionName: string, payload: T): Promise<R> {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
  if (error) throw error;
  return data as R;
}

// --- Typed wrappers for each Edge Function ---

// 1. Autosave/load game state
export async function autosaveGame(payload: { userId: string; state: any }) {
  return callEdgeFunction('autosave', payload);
}

// 2. Coin balance save/load
export async function coinBalanceSaveLoad(payload: { userId: string; coins: number }) {
  return callEdgeFunction('coin_balance_save_load', payload);
}

// 3. Spend/gain coins, purchases, transactions
export async function userUpgradePurchase(payload: { userId: string; upgrade: string; cost: number }) {
  return callEdgeFunction('user_upgrade_purchase', payload);
}

// 4. Airdrop analytics
export async function guardianAngelAirdrop(payload: { userId: string; amount: number }) {
  return callEdgeFunction('guardian_angel_airdrop', payload);
}

// 5. TON Jetton payment verify
export async function tonJettonPaymentVerify(payload: { userId: string; txHash: string }) {
  return callEdgeFunction('ton_jetton_payment_verify', payload);
}

// 6. Slot machine deposit/withdraw
export async function slotMachineDepositWithdraw(payload: { userId: string; amount: number; action: 'deposit' | 'withdraw' }) {
  return callEdgeFunction('slot_machine_deposit_withdraw', payload);
}

// 7. Arcade score submit
export async function arcadeScoreSubmit(payload: { userId: string; game: string; score: number }) {
  return callEdgeFunction('arcade_score_submit', payload);
}

// 8. Chat message send
export async function chatMessageSend(payload: { userId: string; message: string }) {
  return callEdgeFunction('chat_message_send', payload);
}

// 9. NFT mint
export async function nftMint(payload: { userId: string; nftType: string }) {
  return callEdgeFunction('nft_mint', payload);
}

// 10. Marketplace action
export async function marketplaceAction(payload: { userId: string; action: string; itemId: string }) {
  return callEdgeFunction('marketplace_action', payload);
}

// 11. Achievement unlock
export async function achievementUnlock(payload: { userId: string; achievement: string }) {
  return callEdgeFunction('achievement_unlock', payload);
}
