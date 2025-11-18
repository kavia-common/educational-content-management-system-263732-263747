import React, { useEffect, useState } from 'react';
import { apiJson } from '../apiClient';

/**
 * PUBLIC_INTERFACE
 * GradesPage
 * Minimal placeholder showing a list of grades (proxy endpoint).
 */
const GradesPage = () => {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiJson('/grades');
        if (mounted) setItems(Array.isArray(data) ? data : (data?.items || []));
      } catch (e) {
        if (e?.status !== 401) setErr(e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <h2>Grades</h2>
      {err && <div className="text-red-600">Failed to load grades.</div>}
      <ul>
        {items.map(i => <li key={i.id}>{i.courseTitle || i.title} - {i.score || 'N/A'}</li>)}
      </ul>
      {items.length === 0 && !err && <div className="text-gray-600">No grades to show.</div>}
    </div>
  );
};

export default GradesPage;
