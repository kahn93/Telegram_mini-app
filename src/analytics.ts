// analytics.ts
// Simple analytics/event logging for Telegram Mini-App (Supabase)
import { supabase } from './supabaseClient';
import { analyticsEventLog } from './Database/edgeFunctions';

export type AnalyticsEvent = {
  userid: string;
  event: string;
  details?: Record<string, unknown>;
  created_at?: string;
};

const TABLE = 'analytics_events';


export async function logEvent(userid: string, event: string, details?: Record<string, unknown>) {
  await analyticsEventLog({ userid, event, details });
}

export async function getEvents(userid: string, event?: string) {
  let query = supabase.from(TABLE).select('*').eq('userid', userid);
  if (event) query = query.eq('event', event);
  const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
  if (error) return [];
  return data as AnalyticsEvent[];
}
