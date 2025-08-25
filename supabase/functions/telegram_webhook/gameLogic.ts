// Game logic for Telegram bot integration using Supabase
import { supabase } from './supabaseClient.ts';

export async function getUserBalance(userId: string): Promise<number> {
  // Query the 'users' table for the user's balance
  const { data, error } = await supabase
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single();
  if (error || !data) {
    // If user not found, return 0 or handle error as needed
    return 0;
  }
  return data.balance || 0;
// ...existing code...
}
