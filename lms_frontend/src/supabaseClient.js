import { createClient } from "@supabase/supabase-js";

/**
 * Supabase browser client initialized using environment variables.
 * Prototype mode: uses anon key from .env. Do not use service role in frontend.
 *
 * Env:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_ANON_KEY (preferred) or REACT_APP_SUPABASE_KEY (alias)
 * - REACT_APP_FRONTEND_URL (used for default redirect URLs)
 */

// PUBLIC_INTERFACE
export const supabase = (() => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "";
  const supabaseKey =
    process.env.REACT_APP_SUPABASE_ANON_KEY ||
    process.env.REACT_APP_SUPABASE_KEY ||
    "";

  // siteUrl used by helpers in AuthContext for redirectTo/emailRedirectTo
  // Keep here if needed in future to pass via global options.
  const siteUrl = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
  void siteUrl;

  const maskedKey = supabaseKey ? `${supabaseKey.slice(0, 4)}…${supabaseKey.slice(-4)}` : "";

  if (!supabaseUrl || !supabaseKey) {
    // eslint-disable-next-line no-console
    console.warn(
      "[supabaseClient] Missing env vars. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY (or REACT_APP_SUPABASE_KEY) in your .env",
      { urlPresent: Boolean(supabaseUrl), keyPresent: Boolean(supabaseKey) }
    );
  } else {
    // eslint-disable-next-line no-console
    console.log("[supabaseClient] Initializing Supabase client", {
      url: supabaseUrl,
      keyMasked: maskedKey,
    });
  }

  try {
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        // Set safe defaults used by AuthContext helpers as well.
        // Routes should exist in the app router.
        autoRefreshToken: true,
      },
      // future: global headers, schema, etc.
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[supabaseClient] Failed to initialize Supabase client", e);
    throw e;
  }
})();
