import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getLessonById } from '../services/lessonsService';
import { useProgress } from '../hooks/useProgress';

/**
 * PUBLIC_INTERFACE
 * CoursePlayerPage
 * Lesson player page with video playback and mark complete.
 */
export default function CoursePlayerPage() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const { markComplete } = useProgress();
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLessonById(id).then((l) => {
      setLesson(l);
      setLoading(false);
    }).catch((e) => {
      setError(e);
      setLoading(false);
    });
  }, [id]);

  async function complete() {
    setCompleting(true);
    try {
      await markComplete(lesson.id);
      alert('Marked complete!');
    } catch (e) {
      alert(`Unable to mark complete: ${e.message}`);
    } finally {
      setCompleting(false);
    }
  }

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (!lesson) return <div className="text-gray-600">Lesson not found.</div>;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{lesson.title}</h2>
            <p className="text-gray-600 mt-1">{lesson.description}</p>
          </div>
          <div className="flex gap-2">
            {lesson.course_id && <Link to={`/courses/${lesson.course_id}`} className="text-blue-600 hover:underline text-sm">Back to Course</Link>}
          </div>
        </div>
      </Card>

      <Card title="Lesson Video">
        {lesson.video_url ? (
          <div className="aspect-video w-full bg-black rounded overflow-hidden">
            <iframe
              src={lesson.video_url}
              title={lesson.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="text-gray-600">No video provided.</div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={complete} disabled={completing} variant="primary">
          {completing ? 'Marking...' : 'Mark Complete'}
        </Button>
      </div>
    </div>
  );
}
