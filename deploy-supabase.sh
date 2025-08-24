#!/bin/bash
# Deploy all Supabase Edge Functions and database migrations (triggers, logic)

set -e

# Deploy all Edge Functions
npx supabase functions deploy --all --yes

# Push all database migrations (triggers, logic)
npx supabase db push

echo "All Supabase Edge Functions and database triggers/logic deployed!"
