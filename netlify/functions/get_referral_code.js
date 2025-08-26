// netlify/functions/get_referral_code.js
import { getOrCreateReferralCode } from '../../src/Database/referralSupabase';

export default async function handler(req, res) {
  const { userid } = req.query;
  if (!userid) return res.status(400).json({ error: 'Missing userid' });
  const code = await getOrCreateReferralCode(userid);
  res.status(200).json({ code });
}
