import { supabase } from '../supabaseClient';

export interface User {
  userid: string;
  country: string;
  coins: number;
  avatar_url?: string;
  nickname?: string;
  badges?: string[];
}

const TABLE = 'users';

export async function addUserSupabase(user: User) {
  await supabase.from(TABLE).upsert([user], { onConflict: 'userid' });
}

export async function updateUserProfileSupabase(userid: string, profile: Partial<Pick<User, 'avatar_url' | 'nickname' | 'badges'>>) {
  await supabase.from(TABLE).update(profile).eq('userid', userid);
}

export async function updateUserCoinsSupabase(userid: string, coins: number) {
  await supabase.from(TABLE).update({ coins }).eq('userid', userid);
}

export async function getUserSupabase(userid: string): Promise<User | null> {
  const { data } = await supabase.from(TABLE).select('*').eq('userid', userid).single();
  return data || null;
}

export async function getAllUsersSupabase(): Promise<User[]> {
  const { data } = await supabase.from(TABLE).select('*');
  return data || [];
}
