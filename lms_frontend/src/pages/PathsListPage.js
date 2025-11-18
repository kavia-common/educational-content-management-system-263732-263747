import React, { useEffect, useState } from 'react';
import { listPaths } from '../services/pathsService';
import PathCard from '../components/PathCard';
import Button from '../components/ui/Button';
import { DATA_SOURCE } from '../lib/dataMode';

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
    const localMsg = 'No learning paths available in local seed.';
    const supabaseMsg = 'No learning paths available yet.';
    return (
      <div className="text-gray-600">
        {DATA_SOURCE === 'local' ? localMsg : supabaseMsg}
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
