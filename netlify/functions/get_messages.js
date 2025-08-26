// netlify/functions/get_messages.js
import { getMessages } from '../../src/Database/messagesSupabase';

export default async function handler(req, res) {
  const { limit, type } = req.query;
  const messages = await getMessages(Number(limit) || 50, type || 'chat');
  res.status(200).json({ messages });
}
