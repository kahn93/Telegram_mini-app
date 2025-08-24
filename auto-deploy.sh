#!/bin/bash

# Full automation: build frontend, deploy to Netlify, deploy backend to Render, deploy all Supabase Edge Functions and triggers

set -e

# 1. Build frontend
npm run build

# 2. Deploy frontend to Netlify (requires Netlify CLI and login)
# netlify deploy --prod --dir=dist
# Uncomment above and configure if you want to automate Netlify deploy

echo "Frontend build complete. Deploy to Netlify via CLI or web UI as needed."

# 3. Deploy backend to Render (if you have a backend server)
# git push render main
# Uncomment above and configure if you want to automate Render deploy

echo "Backend deploy to Render: push your code or use Render web UI."

# 4. Deploy all Supabase Edge Functions and triggers
./deploy-supabase.sh

echo "All automation steps complete!"
