import { getSupabase, isSupabaseMode } from '../lib/supabaseClient';
import { DATA_SOURCE } from '../lib/dataMode';
import { lessons as seedLessons } from '../data/seed';

/**
 * PUBLIC_INTERFACE
 * listLessonsByCourse
 * List lessons for a given course id ordered by position.
 * In local mode, returns synthesized lessons from seeds.
 */
export async function listLessonsByCourse(courseId) {
  if (DATA_SOURCE === 'local') {
    const cid = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
    return seedLessons
      .filter((l) => l.course_id === cid)
      .map((l, idx) => ({
        ...l,
        position: l.order ?? idx + 1,
        thumbnail_url: l.thumbnail ?? l.thumbnail_url ?? null,
      }))
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }
  if (!isSupabaseMode()) return [];
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
 * Fetch a single lesson by id.
 * In local mode, resolves from seeds.
 */
export async function getLessonById(id) {
  if (DATA_SOURCE === 'local') {
    const lesson = seedLessons.find((l) => String(l.id) === String(id));
    if (!lesson) return null;
    return {
      ...lesson,
      position: lesson.order ?? 1,
      thumbnail_url: lesson.thumbnail ?? lesson.thumbnail_url ?? null,
    };
  }
  if (!isSupabaseMode()) return null;
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
