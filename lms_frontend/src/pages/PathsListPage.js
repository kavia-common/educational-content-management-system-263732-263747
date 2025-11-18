import React, { useEffect, useState } from 'react';
import { listPaths } from '../services/pathsService';
import PathCard from '../components/PathCard';
import Button from '../components/ui/Button';
import { isSupabaseMode } from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * PathsListPage
 * Lists all learning paths.
 */
export default function PathsListPage() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await listPaths();
      setPaths(Array.isArray(data) ? data : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load paths:', e?.message || e);
      setPaths([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="text-gray-500">Loading...</div>;

  if (!paths.length) {
    return (
      <div className="text-gray-600">
        {!isSupabaseMode()
          ? 'Supabase is not configured. Configure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY to load data.'
          : 'No learning paths available yet.'}
        <div className="mt-2"><Button onClick={load} variant="ghost">Retry</Button></div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {paths.map((path) => (
        <PathCard key={path.id} path={path} />
      ))}
    </div>
  );
}
