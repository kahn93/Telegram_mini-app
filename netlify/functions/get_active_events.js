// netlify/functions/get_active_events.js
import { getActiveEvents } from '../../src/Database/eventsSupabase';

export default async function handler(req, res) {
  const now = req.query.now || new Date().toISOString();
  const events = await getActiveEvents(now);
  res.status(200).json({ events });
}
