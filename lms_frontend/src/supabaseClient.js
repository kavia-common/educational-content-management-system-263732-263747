import { createClient } from "@supabase/supabase-js";

/**
 * IMPORTANT: Prefer using src/lib/supabaseClient.getSupabase() which includes
 * feature-flag checks and env validation.
 * This fallback export should not be imported by pages; it exists for legacy imports only.
 * Never use a service role key in frontend code.
 */

// PUBLIC_INTERFACE
export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);
