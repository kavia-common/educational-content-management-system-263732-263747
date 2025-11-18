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
      if (!userId) {
        setProfile(null);
        setRole('guest');
        setLoading(false);
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
      } else {
        setProfile(data || null);
        setRole((data && data.role) ? data.role : 'learner');
      }
    } catch (e) {
      setError(e);
      setProfile(null);
      setRole('learner');
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
        const { data: listener } = supabase.auth.onAuthStateChange((_event) => {
          if (mounted) fetchProfile();
        });
        sub = listener?.subscription || null;
      } catch {
        // ignore
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
