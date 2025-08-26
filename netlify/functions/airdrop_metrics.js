// netlify/functions/airdrop_metrics.js

const { getPlayerMetrics } = require('../../src/Logic/AirdropLogic');

module.exports = async function handler(req, res) {
  const { playerId } = req.query;
  if (!playerId) return res.status(400).json({ error: 'Missing playerId' });
  const metrics = await getPlayerMetrics(playerId);
  res.status(200).json(metrics);
};
