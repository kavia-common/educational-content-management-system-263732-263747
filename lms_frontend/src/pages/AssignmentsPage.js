import React, { useEffect, useState } from 'react';
import { apiJson } from '../apiClient';

/**
 * PUBLIC_INTERFACE
 * AssignmentsPage
 * Minimal placeholder page showing assignments list (proxy endpoint).
 */
const AssignmentsPage = () => {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiJson('/assignments');
        if (mounted) setItems(Array.isArray(data) ? data : (data?.items || []));
      } catch (e) {
        if (e?.status !== 401) setErr(e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <h2>Assignments</h2>
      {err && <div className="text-red-600">Failed to load assignments.</div>}
      <ul>
        {items.map(i => <li key={i.id}>{i.title}</li>)}
      </ul>
      {items.length === 0 && !err && <div className="text-gray-600">No assignments found.</div>}
    </div>
  );
};

export default AssignmentsPage;
