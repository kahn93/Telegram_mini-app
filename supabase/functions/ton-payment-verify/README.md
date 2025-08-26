# TON Payment Verification Edge Function

This function verifies TON payments to your app's wallet for deposit automation.

## Environment Variables
- TONCENTER_API_KEY: Your Toncenter API key (get from https://toncenter.com/)

## Usage
POST to this function with:
```
{
  "txHash": "<transaction_hash>",
  "userId": "<user_id>",
  "amountTon": 0.1
}
```

Returns `{ ok: true, userId, txHash }` if verified, or error details if not.

## Security
- Always verify the payment on-chain before crediting coins.
- Optionally, update Supabase DB here to mark deposit as complete.

## Deployment
- Place this function in `supabase/functions/ton-payment-verify/index.ts`
- Deploy with: `npx supabase functions deploy ton-payment-verify`
