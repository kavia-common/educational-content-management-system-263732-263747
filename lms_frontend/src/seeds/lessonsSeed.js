import { getSupabase, isSupabaseMode } from "../lib/supabaseClient";

/**
 * PUBLIC_INTERFACE
 * seedLessons
 * Idempotently upserts static course lesson data into the 'course_lessons' table.
 * - Requires feature flag FLAG_SUPABASE_MODE=true and FLAG_ALLOW_SEED=true (see FeatureFlagsContext).
 * - Uses Supabase anon key and relies on RLS policies permitting insert/upsert by an admin/instructor role.
 * - Upserts on (course_id, title) for idempotency.
 *
 * Data shape per row:
 * { course_id: string (uuid), title: string, thumbnail?: string, duration?: number, sequence: number }
 *
 * Notes:
 * - Batches to avoid payload size limits.
 * - Throws on first error with concise message; upstream UI should catch and display brief alert/toast.
 */

/** Example static lessons data. In a real integration, you may import from src/seeds/fixtures/lessons.json */
const lessonsData = [
  // React course (example uuid placeholder - replace with your course ids)
  {
    courseId: "00000000-0000-0000-0000-000000000001",
    lessons: [
      { title: "Intro to React", thumbnail: null, duration: 8, sequence: 1 },
      { title: "Components & Props", thumbnail: null, duration: 12, sequence: 2 },
      { title: "State & Effects", thumbnail: null, duration: 14, sequence: 3 },
    ],
  },
  // JavaScript course
  {
    courseId: "00000000-0000-0000-0000-000000000002",
    lessons: [
      { title: "JS Basics", thumbnail: null, duration: 10, sequence: 1 },
      { title: "Functions & Scope", thumbnail: null, duration: 15, sequence: 2 },
      { title: "Async JS", thumbnail: null, duration: 18, sequence: 3 },
    ],
  },
  // HTML
  {
    courseId: "00000000-0000-0000-0000-000000000003",
    lessons: [
      { title: "HTML Foundations", thumbnail: null, duration: 9, sequence: 1 },
      { title: "Semantic HTML", thumbnail: null, duration: 11, sequence: 2 },
    ],
  },
  // CSS
  {
    courseId: "00000000-0000-0000-0000-000000000004",
    lessons: [
      { title: "Selectors & Specificity", thumbnail: null, duration: 10, sequence: 1 },
      { title: "Flexbox & Grid", thumbnail: null, duration: 16, sequence: 2 },
    ],
  },
  // Python
  {
    courseId: "00000000-0000-0000-0000-000000000005",
    lessons: [
      { title: "Python Intro", thumbnail: null, duration: 12, sequence: 1 },
      { title: "Data Structures", thumbnail: null, duration: 20, sequence: 2 },
    ],
  },
  // Django
  {
    courseId: "00000000-0000-0000-0000-000000000006",
    lessons: [
      { title: "Django Project Setup", thumbnail: null, duration: 14, sequence: 1 },
      { title: "Models & ORM", thumbnail: null, duration: 22, sequence: 2 },
    ],
  },
  // SQL
  {
    courseId: "00000000-0000-0000-0000-000000000007",
    lessons: [
      { title: "SELECT Basics", thumbnail: null, duration: 10, sequence: 1 },
      { title: "JOINs", thumbnail: null, duration: 18, sequence: 2 },
    ],
  },
  // Cloud
  {
    courseId: "00000000-0000-0000-0000-000000000008",
    lessons: [
      { title: "Cloud Fundamentals", thumbnail: null, duration: 12, sequence: 1 },
      { title: "IAM & Networking", thumbnail: null, duration: 20, sequence: 2 },
    ],
  },
  // DevOps
  {
    courseId: "00000000-0000-0000-0000-000000000009",
    lessons: [
      { title: "CI/CD Basics", thumbnail: null, duration: 14, sequence: 1 },
      { title: "Containers 101", thumbnail: null, duration: 16, sequence: 2 },
    ],
  },
  // Testing
  {
    courseId: "00000000-0000-0000-0000-00000000000a",
    lessons: [
      { title: "Testing Pyramid", thumbnail: null, duration: 9, sequence: 1 },
      { title: "Unit vs Integration", thumbnail: null, duration: 12, sequence: 2 },
    ],
  },
];

// PUBLIC_INTERFACE
export async function seedLessons(customSets) {
  /**
   * Execute upsert for lessons. Optionally pass customSets in the same shape
   * as lessonsData to override defaults.
   *
   * @param {Array<{courseId:string, lessons:Array<{title:string, thumbnail?:string|null, duration?:number|null, sequence:number}>}>} [customSets]
   * @returns {Promise<{inserted:number, updated:number, total:number}>}
   */
  if (!isSupabaseMode()) {
    const err = new Error("Supabase mode is not enabled (FLAG_SUPABASE_MODE).");
    err.code = "FLAG_SUPABASE_MODE_DISABLED";
    throw err;
  }

  const supabase = getSupabase();

  // Transform provided sets into flat rows
  const sets = Array.isArray(customSets) ? customSets : lessonsData;
  const rows = [];
  sets.forEach((set) => {
    const courseId = set.courseId;
    (set.lessons || []).forEach((l) => {
      if (!courseId || !l?.title || typeof l.sequence !== "number") return;
      rows.push({
        course_id: courseId,
        title: String(l.title),
        thumbnail: l.thumbnail || null,
        duration: typeof l.duration === "number" ? l.duration : null,
        sequence: l.sequence,
      });
    });
  });

  if (rows.length === 0) {
    return { inserted: 0, updated: 0, total: 0 };
  }

  // Batch upserts to avoid payload limits
  const BATCH_SIZE = 500;
  let affected = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const slice = rows.slice(i, i + BATCH_SIZE);
    // Upsert on compound uniqueness (course_id, title)
    const { error, count } = await supabase
      .from("course_lessons")
      .upsert(slice, { onConflict: "course_id,title", ignoreDuplicates: false, count: "exact" });

    if (error) {
      const err = new Error("Failed to upsert course lessons");
      err.cause = error.message;
      throw err;
    }
    // Supabase count in upsert currently returns affected rows count when count:"exact" is used
    if (typeof count === "number") affected += count;
  }

  return { inserted: affected, updated: 0, total: rows.length };
}
