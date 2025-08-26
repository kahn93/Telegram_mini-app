// netlify/functions/get_passive_income.js
import { getPassiveIncomePerHour } from '../../src/Database/passiveIncomeLogic';

export default async function handler(req, res) {
  const income = getPassiveIncomePerHour();
  res.status(200).json({ income });
}
