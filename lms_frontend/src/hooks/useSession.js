import { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * useSession
 * A React hook that subscribes to Supabase auth state changes and returns the current session.
 * Ensures PKCE session persistence and real-time updates on login/logout/refresh.
 */
export function useSession() {
  /** This is a public function hook that returns Supabase session and loading state. */
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let sub = null;

    async function setup() {
      try {
        const supabase = getSupabase();
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(data.session ?? null);
          setLoading(false);
          // eslint-disable-next-line no-console
          console.debug("[useSession] initial session", { hasSession: !!data.session });
        }
        const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (isMounted) {
            // eslint-disable-next-line no-console
            console.debug("[useSession] auth state change", { event, hasSession: !!newSession });
            setSession(newSession ?? null);
          }
        });
        sub = listener?.subscription || null;
      } catch (e) {
        if (isMounted) setLoading(false);
        // eslint-disable-next-line no-console
        console.warn("[useSession] error", e);
      }
    }

    setup();

    return () => {
      isMounted = false;
      try {
        sub?.unsubscribe();
      } catch {
        // ignore
      }
    };
  }, []);

  return { session, loading };
}
