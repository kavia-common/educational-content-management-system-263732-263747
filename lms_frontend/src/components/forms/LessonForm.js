import React, { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';

/**
 * PUBLIC_INTERFACE
 * LessonForm
 * Admin form to create/update a lesson.
 */
export default function LessonForm({ initial = {}, onSubmit, submitting = false, courses = [] }) {
  /** Controlled form for lesson */
  const [form, setForm] = useState({
    id: initial.id || undefined,
    title: initial.title || '',
    description: initial.description || '',
    video_url: initial.video_url || '',
    course_id: initial.course_id || '',
    position: initial.position || 1,
    thumbnail_url: initial.thumbnail_url || '',
  });

  function change(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'position' ? Number(value) : value }));
  }

  function submit(e) {
    e.preventDefault();
    onSubmit?.(form);
  }

  return (
    <Card title={form.id ? 'Edit Lesson' : 'New Lesson'}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700">Title</label>
            <input className="mt-1 w-full border rounded-md p-2" name="title" value={form.title} onChange={change} required />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Position</label>
            <input className="mt-1 w-full border rounded-md p-2" name="position" value={form.position} onChange={change} type="number" min="1" required />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Course</label>
          <select className="mt-1 w-full border rounded-md p-2" name="course_id" value={form.course_id} onChange={change} required>
            <option value="">Select course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Description</label>
          <textarea className="mt-1 w-full border rounded-md p-2" name="description" value={form.description} onChange={change} rows={3} />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Video URL</label>
          <input className="mt-1 w-full border rounded-md p-2" name="video_url" value={form.video_url} onChange={change} placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Thumbnail URL</label>
          <input className="mt-1 w-full border rounded-md p-2" name="thumbnail_url" value={form.thumbnail_url} onChange={change} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" variant="primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </Card>
  );
}
