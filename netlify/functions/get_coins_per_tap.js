// netlify/functions/get_coins_per_tap.js
import { getCoinsPerTap } from '../../src/Database/coinsPerTapLogic.js';

export default async function handler(req, res) {
  const coinCount = parseInt(req.query.coinCount || '0', 10);
  const coins = getCoinsPerTap(coinCount);
  res.status(200).json({ coins });
}
