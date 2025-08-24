import { supabase } from '../supabaseClient';

export interface Event {
  id?: number;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  reward?: string; // Change 'string' to the appropriate type if needed
}

export interface EventParticipant {
  id?: number;
  event_id: number;
  userid: string;
  progress?: number;
  completed?: boolean;
  reward_claimed?: boolean;
}

export async function getActiveEvents(now: string = new Date().toISOString()) {
  const { data } = await supabase
    .from('events')
    .select('*')
    .lte('start_time', now)
    .gte('end_time', now)
    .order('start_time', { ascending: true });
  return data || [];
}

export async function joinEvent(event_id: number, userid: string) {
  await supabase.from('event_participants').upsert([{ event_id, userid }], { onConflict: 'event_id,userid' });
}

export async function getEventParticipants(event_id: number) {
  const { data } = await supabase
    .from('event_participants')
    .select('*')
    .eq('event_id', event_id);
  return data || [];
}

export async function updateEventProgress(event_id: number, userid: string, progress: number, completed: boolean) {
  await supabase.from('event_participants').update({ progress, completed }).eq('event_id', event_id).eq('userid', userid);
}

export async function claimEventReward(event_id: number, userid: string) {
  await supabase.from('event_participants').update({ reward_claimed: true }).eq('event_id', event_id).eq('userid', userid);
}
