import React, { useEffect, useState } from 'react';
import Stat from '../components/ui/Stat';
import Card from '../components/ui/Card';
import { getSupabase } from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * AdminDashboardPage
 * Overview dashboard with entity counts and recent completions.
 */
export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({ learners: 0, paths: 0, courses: 0, lessons: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const supabase = getSupabase();
      const [{ count: paths }, { count: courses }, { count: lessons }, { count: learners }] = await Promise.all([
        supabase.from('learning_paths').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('lessons').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      const { data: recentProgress } = await supabase
        .from('course_progress')
        .select('id, user_id, lesson_id, is_completed, completed_at')
        .order('completed_at', { ascending: false })
        .limit(10);

      setCounts({
        learners: learners || 0,
        paths: paths || 0,
        courses: courses || 0,
        lessons: lessons || 0,
      });
      setRecent(recentProgress || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">Admin Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Learners" value={counts.learners} />
        <Stat label="Paths" value={counts.paths} />
        <Stat label="Courses" value={counts.courses} />
        <Stat label="Lessons" value={counts.lessons} />
      </div>

      <Card title="Recent Progress">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : recent.length === 0 ? (
          <div className="text-gray-600">No progress yet.</div>
        ) : (
          <div className="divide-y">
            {recent.map(r => (
              <div key={r.id} className="py-2 text-sm text-gray-700">
                User {String(r.user_id || '').slice(0, 8)} • Lesson {String(r.lesson_id || '').slice(0, 8)} • {r.is_completed ? 'Completed' : 'Updated'} • {r.completed_at ? new Date(r.completed_at).toLocaleString() : 'N/A'}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
