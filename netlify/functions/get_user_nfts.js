// netlify/functions/get_user_nfts.js
import { getUserNFTs } from '../../src/Database/nftsSupabase';

export default async function handler(req, res) {
  const { userid } = req.query;
  if (!userid) return res.status(400).json({ error: 'Missing userid' });
  const nfts = await getUserNFTs(userid);
  res.status(200).json({ nfts });
}
