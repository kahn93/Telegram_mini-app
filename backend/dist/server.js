"use strict";
// Minimal Express server for Render backend
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const supabase_js_1 = require("@supabase/supabase-js");
const node_fetch_1 = __importDefault(require("node-fetch"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Supabase client
const supabase = (0, supabase_js_1.createClient)(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');
// Health check
app.get('/', (_req, res) => {
    res.send('Backend is running!');
});
// Telegram Bot Webhook
app.post('/webhook/telegram', async (req, res) => {
    const update = req.body;
    // Example: handle /balance command
    if (update.message && update.message.text === '/balance') {
        const userId = update.message.from.id;
        // Fetch user balance from Supabase
        const { data } = await supabase.from('users').select('coins').eq('userid', userId).single();
        // Respond to Telegram
        await (0, node_fetch_1.default)(`https://api.telegram.org/bot${process.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: userId,
                text: data ? `Your balance: ${data.coins}` : 'User not found.'
            })
        });
    }
    res.status(200).json({ ok: true });
});
// TON Payment Webhook
app.post('/webhook/ton', async (req, res) => {
    const payment = req.body;
    // Example: update user balance on payment
    if (payment && payment.userId && payment.amount) {
        await supabase.from('users').update({ coins: payment.amount }).eq('userid', payment.userId);
    }
    res.status(200).json({ ok: true });
});
// Supabase Edge Function Webhook (for DB events)
app.post('/webhook/supabase', async (req, res) => {
    const event = req.body;
    // Example: log event
    await supabase.from('event_logs').insert([{ event_type: event.type, payload: event }]);
    res.status(200).json({ ok: true });
});
// Analytics/Referral Webhook
app.post('/webhook/analytics', async (req, res) => {
    const analytics = req.body;
    // Example: log analytics event
    await supabase.from('analytics').insert([analytics]);
    res.status(200).json({ ok: true });
});
// Anti-Cheat Webhook
app.post('/webhook/anticheat', async (req, res) => {
    const report = req.body;
    // Example: log anti-cheat report
    await supabase.from('anticheat_reports').insert([report]);
    res.status(200).json({ ok: true });
});
// NFT Mint/Transfer Webhook
app.post('/webhook/nft', async (req, res) => {
    const nftEvent = req.body;
    // Example: update NFT ownership
    if (nftEvent && nftEvent.nft_id && nftEvent.userid) {
        await supabase.from('nfts').update({ userid: nftEvent.userid }).eq('nft_id', nftEvent.nft_id);
    }
    res.status(200).json({ ok: true });
});
// Third-Party Notification Webhook (e.g., Discord, Slack)
app.post('/webhook/notify', async (req, res) => {
    const notification = req.body;
    // Example: send to Slack webhook
    if (process.env.SLACK_WEBHOOK_URL) {
        await (0, node_fetch_1.default)(process.env.SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: notification.message })
        });
    }
    res.status(200).json({ ok: true });
});
// Example endpoint for your game (expand as needed)
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
