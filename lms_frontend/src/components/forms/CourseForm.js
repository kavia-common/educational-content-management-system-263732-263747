import React, { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';

/**
 * PUBLIC_INTERFACE
 * CourseForm
 * Admin form to create/update a course.
 */
export default function CourseForm({ initial = {}, onSubmit, submitting = false, paths = [] }) {
  /** Controlled form for course */
  const [form, setForm] = useState({
    id: initial.id || undefined,
    title: initial.title || '',
    description: initial.description || '',
    thumbnail_url: initial.thumbnail_url || '',
    path_id: initial.path_id || '',
  });

  function change(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function submit(e) {
    e.preventDefault();
    onSubmit?.(form);
  }

  return (
    <Card title={form.id ? 'Edit Course' : 'New Course'}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700">Title</label>
            <input className="mt-1 w-full border rounded-md p-2" name="title" value={form.title} onChange={change} required />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Path</label>
            <select className="mt-1 w-full border rounded-md p-2" name="path_id" value={form.path_id} onChange={change} required>
              <option value="">Select learning path</option>
              {paths.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Description</label>
          <textarea className="mt-1 w-full border rounded-md p-2" name="description" value={form.description} onChange={change} rows={3} />
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
