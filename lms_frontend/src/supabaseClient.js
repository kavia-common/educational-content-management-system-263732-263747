import { createClient } from "@supabase/supabase-js";

/**
 * IMPORTANT: Browser usage must ONLY use the Supabase anon public key.
 * Never use a service role key in frontend code. Ensure REACT_APP_SUPABASE_KEY
 * (or REACT_APP_SUPABASE_ANON_KEY) is set to the anon key and RLS policies are enforced.
 */

// PUBLIC_INTERFACE
export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);
