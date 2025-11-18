import { useEffect, useState, useCallback } from 'react';
import { getSupabase } from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * useProfile
 * Fetches the current user's profile from the 'profiles' table.
 * RLS-friendly: relies on authenticated session context.
 */
export function useProfile() {
  /** Hook returns profile, role, loading, and error for current user. */
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState('learner');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getUser();
      const userId = sessionData?.user?.id;
      // Diagnostic tracing
      // eslint-disable-next-line no-console
      console.debug("[useProfile.fetch] userId:", userId);

      if (!userId) {
        setProfile(null);
        setRole('guest');
        setLoading(false);
        // eslint-disable-next-line no-console
        console.debug("[useProfile.fetch] no user -> role=guest");
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        setError(error);
        setProfile(null);
        setRole('learner');
        // eslint-disable-next-line no-console
        console.warn("[useProfile.fetch] error fetching profile", error);
      } else {
        setProfile(data || null);
        const r = (data && data.role) ? data.role : 'learner';
        setRole(r);
        // eslint-disable-next-line no-console
        console.debug("[useProfile.fetch] profile loaded", { role: r });
      }
    } catch (e) {
      setError(e);
      setProfile(null);
      setRole('learner');
      // eslint-disable-next-line no-console
      console.warn("[useProfile.fetch] exception", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let sub = null;
    let mounted = true;

    (async () => {
      await fetchProfile();
      try {
        const supabase = getSupabase();
        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
          if (mounted) {
            // eslint-disable-next-line no-console
            console.debug("[useProfile] auth change event:", event, "-> refetch");
            fetchProfile();
          }
        });
        sub = listener?.subscription || null;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[useProfile] subscribe error", e);
      }
    })();

    return () => {
      mounted = false;
      try {
        sub?.unsubscribe();
      } catch {
        // ignore
      }
    };
  }, [fetchProfile]);

  return { profile, role, loading, error, refetch: fetchProfile };
}
