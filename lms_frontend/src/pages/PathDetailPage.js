import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPathById } from '../services/pathsService';
import CourseCard from '../components/CourseCard';
import Card from '../components/ui/Card';

/**
 * PUBLIC_INTERFACE
 * PathDetailPage
 * Shows a learning path and its courses.
 */
export default function PathDetailPage() {
  const { id } = useParams();
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPathById(id).then((data) => {
      setPath(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (!path) return <div className="text-gray-600">Path not found.</div>;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start gap-4">
          {path.thumbnail_url && <img src={path.thumbnail_url} alt="" className="w-24 h-24 rounded object-cover" />}
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{path.title}</h2>
            <p className="text-gray-600 mt-1">{path.description}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3 mt-2">
        {(path.courses || []).length === 0 ? (
          <div className="text-gray-600">No courses in this path yet.</div>
        ) : (
          path.courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        )}
      </div>
    </div>
  );
}
