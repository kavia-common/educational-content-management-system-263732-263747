import { supabase } from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * getCurrentProfile
 * Fetch current user's profile.
 */
export async function getCurrentProfile() {
  /** RLS-friendly profile fetch */
  const { data: userRes, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const userId = userRes?.user?.id;
  if (!userId) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}
