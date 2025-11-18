import { createClient } from "@supabase/supabase-js";

/**
 * Supabase browser client initialized using environment variables.
 * Prototype mode: uses anon key from .env. Do not use service role in frontend.
 *
 * Env:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_KEY or REACT_APP_SUPABASE_ANON_KEY (prototype only; prefer anon key + RLS)
 */

// PUBLIC_INTERFACE
export const supabase = (() => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // eslint-disable-next-line no-console
    console.warn(
      "[supabaseClient] Missing env vars. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY (or REACT_APP_SUPABASE_ANON_KEY) in your .env"
    );
  }

  try {
    return createClient(supabaseUrl || "", supabaseKey || "", {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[supabaseClient] Failed to initialize Supabase client", e);
    throw e;
  }
})();
