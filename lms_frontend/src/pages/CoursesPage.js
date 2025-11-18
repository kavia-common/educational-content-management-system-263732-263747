import React, { useEffect, useState } from 'react';
import CourseCard from '../components/CourseCard';
import { listCourses, enroll } from '../services/coursesService';
import { isSupabaseMode } from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * CoursesPage
 * Lists all available courses and allows enrollment.
 */
const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [workingId, setWorkingId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await listCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load courses:', e?.message || e);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onEnroll(id) {
    if (!id || workingId) return;
    setWorkingId(id);
    const prev = courses;
    setCourses((list) => list.map(c => c.id === id ? { ...c, enrolled: true } : c));
    try {
      await enroll(id);
    } catch {
      setCourses(prev);
    } finally {
      setWorkingId(null);
    }
  }

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (!courses.length) {
    return (
      <div className="text-gray-600">
        {!isSupabaseMode()
          ? 'Supabase is not configured. Configure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY to load data.'
          : 'No courses available.'}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} onEnroll={onEnroll} enrolling={workingId === course.id} />
      ))}
    </div>
  );
};

export default CoursesPage;
