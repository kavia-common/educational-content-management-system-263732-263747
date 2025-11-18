import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import CourseForm from '../../components/forms/CourseForm';
import { listCourses, upsertCourse, deleteCourse } from '../../services/coursesService';
import { listPaths } from '../../services/pathsService';

/**
 * PUBLIC_INTERFACE
 * CoursesCrudPage
 * Admin CRUD interface for courses.
 */
export default function CoursesCrudPage() {
  /** Page to manage courses with list and form */
  const [items, setItems] = useState([]);
  const [paths, setPaths] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [courses, p] = await Promise.all([listCourses(), listPaths()]);
      setItems(courses);
      setPaths(p);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSave(form) {
    setSaving(true);
    setError(null);
    try {
      await upsertCourse(form);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this course?')) return;
    try {
      await deleteCourse(id);
      await load();
    } catch (e) {
      setError(e);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Courses</h1>
        <Button variant="primary" onClick={() => setEditing({})}>New Course</Button>
      </div>

      {editing && (
        <CourseForm initial={editing.id ? editing : {}} onSubmit={onSave} submitting={saving} paths={paths} />
      )}

      <Card>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-600">Error: {error.message}</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600">
            No courses yet. Create your first course. Ensure there is at least one learning path to link to.
            <div className="mt-2">
              <Button onClick={() => setEditing({})}>Create Course</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(c => (
              <div key={c.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-sm text-gray-500">{c.description}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setEditing(c)}>Edit</Button>
                  <Button variant="secondary" onClick={() => onDelete(c.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
