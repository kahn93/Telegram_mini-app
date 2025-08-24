// src/utils/webhooks.ts
// Helper functions to trigger all recommended webhooks from the frontend

const API_URL = import.meta.env.VITE_API_URL;

export async function triggerAnalytics(event: string, userId: string, referrerId?: string) {
  return fetch(`${API_URL}/webhook/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, userId, referrerId })
  });
}

export async function triggerAntiCheat(userId: string, reason: string, details?: string) {
  return fetch(`${API_URL}/webhook/anticheat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, reason, details })
  });
}

export async function triggerNFT(nft_id: string, userId: string, action: string = 'mint') {
  return fetch(`${API_URL}/webhook/nft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nft_id, userid: userId, action })
  });
}

export async function triggerNotify(message: string) {
  return fetch(`${API_URL}/webhook/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
}

// Example: call these in your React components after user actions
// import { triggerAnalytics, triggerAntiCheat, triggerNFT, triggerNotify } from '../utils/webhooks';
// triggerAnalytics('referral', userId, referrerId);
// triggerAntiCheat(userId, 'suspicious activity', 'Unusually high score');
// triggerNFT(nftId, userId, 'mint');
// triggerNotify('A new high score was set!');
