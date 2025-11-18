import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

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

  async function fetchProfile() {
    setLoading(true);
    setError(null);
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
      .single();

    if (error) {
      setError(error);
      setProfile(null);
      setRole('learner');
    } else {
      setProfile(data);
      setRole(data?.role || 'learner');
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProfile();
    const { data: sub } = supabase.auth.onAuthStateChange((_event) => {
      fetchProfile();
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return { profile, role, loading, error, refetch: fetchProfile };
}
