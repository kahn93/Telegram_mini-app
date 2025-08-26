# TON Withdraw Edge Function

This function handles TON withdrawal requests from users.

## Usage
POST to this function with:
```
{
  "userId": "<user_id>",
  "withdrawAddress": "<ton_wallet_address>",
  "coinAmount": 100,
  "tonAmount": 0.1
}
```

Returns `{ ok: true, userId, withdrawAddress, tonAmount }` if accepted.

## Security
- In production, never send TON from an Edge Function. Use a secure backend with the wallet's private key.
- This function is a demo: it only marks the withdrawal as requested.
- You should update Supabase DB to mark the withdrawal and debit coins.

## Deployment
- Place this function in `supabase/functions/ton-withdraw/index.ts`
- Deploy with: `npx supabase functions deploy ton-withdraw`
