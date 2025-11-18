import { createClient } from "@supabase/supabase-js";

/**
 * Supabase browser client initialized using environment variables.
 * Prototype mode: uses REACT_APP_SUPABASE_KEY from .env. Do not use service role in frontend.
 *
 * Env:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_KEY   (prototype only; switch to anon key + RLS later)
 */

// PUBLIC_INTERFACE
export const supabase = (() => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // eslint-disable-next-line no-console
    console.warn(
      "[supabaseClient] Missing env vars. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in your .env"
    );
  }

  try {
    return createClient(supabaseUrl || "", supabaseKey || "");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[supabaseClient] Failed to initialize Supabase client", e);
    throw e;
  }
})();
