// Supabase client for Edge Functions (Deno)
// Use the official Supabase Deno import for Edge Functions
import { createClient } from "https://deno.land/x/supabase@1.0.0/mod.ts";

// Use environment variables for production (set in Supabase dashboard)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
