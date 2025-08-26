// netlify/functions/get_user_analytics.js
import { getUserAnalytics } from '../../src/Database/userAnalyticsSupabase';

export default async function handler(req, res) {
  const { userid } = req.query;
  if (!userid) return res.status(400).json({ error: 'Missing userid' });
  const analytics = await getUserAnalytics(userid);
  res.status(200).json(analytics);
}
