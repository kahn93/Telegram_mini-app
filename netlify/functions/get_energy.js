// netlify/functions/get_energy.js
import { getInitialEnergy } from '../../src/Database/energyLogic';

export default async function handler(req, res) {
  const energy = getInitialEnergy();
  res.status(200).json({ energy });
}
