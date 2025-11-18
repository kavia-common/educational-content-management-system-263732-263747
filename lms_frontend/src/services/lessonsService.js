import { supabase } from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * listLessonsByCourse
 * List lessons for a given course id ordered by position.
 */
export async function listLessonsByCourse(courseId) {
  /** Fetch lessons by course id */
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, description, video_url, course_id, position, thumbnail_url')
    .eq('course_id', courseId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * PUBLIC_INTERFACE
 * getLessonById
 * Fetch a single lesson by id.
 */
export async function getLessonById(id) {
  /** Fetch lesson by id */
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, description, video_url, course_id, position, thumbnail_url')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * upsertLesson
 * Admin upsert for a lesson.
 */
export async function upsertLesson(payload) {
  /** Insert or update lesson; relies on RLS allowing admin role. */
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
  /** Delete lesson by id */
  const { error } = await supabase.from('lessons').delete().eq('id', id);
  if (error) throw error;
  return true;
}
