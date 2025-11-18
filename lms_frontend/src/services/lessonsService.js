import { getSupabase } from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * listLessonsByCourse
 * List lessons for a given course id ordered by position (Supabase only).
 */
export async function listLessonsByCourse(courseId) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('lessons')
      .select('id, title, description, video_url, course_id, position, thumbnail_url')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('listLessonsByCourse fallback to empty due to error:', e?.message || e);
    return [];
  }
}

/**
 * PUBLIC_INTERFACE
 * getLessonById
 * Fetch a single lesson by id (Supabase only).
 */
export async function getLessonById(id) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('lessons')
      .select('id, title, description, video_url, course_id, position, thumbnail_url')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('getLessonById returning null due to error:', e?.message || e);
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * upsertLesson
 * Admin upsert for a lesson.
 */
export async function upsertLesson(payload) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('lessons').upsert(payload).select().single();
  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * deleteLesson
 * Admin delete a lesson by id.
 */
export async function deleteLesson(id) {
  const supabase = getSupabase();
  const { error } = await supabase.from('lessons').delete().eq('id', id);
  if (error) throw error;
  return true;
}
