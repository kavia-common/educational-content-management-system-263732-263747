import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PathForm from '../../components/forms/PathForm';
import { listPaths, upsertPath, deletePath } from '../../services/pathsService';

/**
 * PUBLIC_INTERFACE
 * PathsCrudPage
 * Admin CRUD interface for learning paths.
 */
export default function PathsCrudPage() {
  /** Page to manage learning paths with list and form */
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listPaths();
      setItems(data);
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
      await upsertPath(form);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this learning path?')) return;
    try {
      await deletePath(id);
      await load();
    } catch (e) {
      setError(e);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Learning Paths</h1>
        <Button variant="primary" onClick={() => setEditing({})}>New Path</Button>
      </div>

      {editing && (
        <PathForm initial={editing.id ? editing : {}} onSubmit={onSave} submitting={saving} />
      )}

      <Card>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-600">Error: {error.message}</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600">
            No learning paths yet. Create your first one.
            <div className="mt-2">
              <Button onClick={() => setEditing({})}>Create Path</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(p => (
              <div key={p.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm text-gray-500">{p.description}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setEditing(p)}>Edit</Button>
                  <Button variant="secondary" onClick={() => onDelete(p.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
