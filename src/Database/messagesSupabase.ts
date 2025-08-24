import { supabase } from '../supabaseClient';

export interface Message {
  id?: number;
  userid: string;
  content: string;
  created_at?: string;
  type?: string;
  reply_to?: number | null;
}

export async function sendMessage(userid: string, content: string, type: string = 'chat', reply_to?: number) {
  const { data, error } = await supabase.from('messages').insert([
    { userid, content, type, reply_to: reply_to || null },
  ]);
  return { data, error };
}

export async function getMessages(limit = 50, type: string = 'chat') {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}
