import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * useProgress
 * Returns progress aggregates for current user and helper to mark lesson complete.
 */
export function useProgress() {
  /** Hook returns aggregate counts and markComplete function with loading and error. */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id;
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }

    // RLS-friendly: filtered by current user
    const { data, error } = await supabase
      .from('course_progress')
      .select('id, user_id, lesson_id, is_completed, completed_at');

    if (error) {
      setError(error);
      setRows([]);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  }, []);

  const aggregates = useMemo(() => {
    const completed = rows.filter(r => r.is_completed).length;
    const inProgress = rows.filter(r => !r.is_completed && r.completed_at !== null).length; // placeholder logic
    const notStarted = Math.max(0, rows.length - (completed + inProgress));
    return { completed, inProgress, notStarted, totalTracked: rows.length };
  }, [rows]);

  const markComplete = useCallback(async (lessonId) => {
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('course_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        is_completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,lesson_id' });

    if (error) {
      throw error;
    }
    await load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...aggregates, rows, loading, error, reload: load, markComplete };
}
