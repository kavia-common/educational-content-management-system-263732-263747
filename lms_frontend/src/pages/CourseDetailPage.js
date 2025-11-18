import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById } from '../services/coursesService';
import { listLessonsByCourse } from '../services/lessonsService';
import Card from '../components/ui/Card';

/**
 * PUBLIC_INTERFACE
 * CourseDetailPage
 * Shows a course and its lessons list.
 */
export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getCourseById(id), listLessonsByCourse(id)])
      .then(([c, ls]) => {
        if (!mounted) return;
        setCourse(c || null);
        setLessons(Array.isArray(ls) ? ls : []);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (!course) return <div className="text-gray-600">Course not found.</div>;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start gap-4">
          {course.thumbnail_url && <img src={course.thumbnail_url} alt="" className="w-24 h-24 rounded object-cover" />}
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{course.title}</h2>
            <p className="text-gray-600 mt-1">{course.description}</p>
          </div>
        </div>
      </Card>

      <Card title="Lessons">
        {lessons.length === 0 ? (
          <div className="text-gray-600">No lessons yet.</div>
        ) : (
          <ul className="space-y-2">
            {lessons.map((lesson) => (
              <li key={lesson.id} className="flex items-center justify-between">
                <Link to={`/lessons/${lesson.id}`} className="text-blue-600 hover:underline">
                  {(lesson.position ?? lesson.order) ? `${lesson.position ?? lesson.order}. ` : ''}{lesson.title}
                </Link>
                <Link to={`/lessons/${lesson.id}`} className="text-sm text-gray-500 hover:text-gray-700">Open</Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
