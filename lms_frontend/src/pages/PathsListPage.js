import React, { useEffect, useState } from "react";
import "../components/layout.css";
import PathCard from "../components/PathCard";
import { pathsService } from "../services/pathsService";

/**
 * Lists Learning Paths available to the current user.
 * Fetches from GET ${REACT_APP_BACKEND_URL}/api/learning-paths via apiClient.
 */
// PUBLIC_INTERFACE
export default function PathsListPage() {
  const [paths, setPaths] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await pathsService.list();
        if (!mounted) return;
        const items = Array.isArray(data) ? data : data?.items || [];
        setPaths(items);
      } catch (e) {
        if (!mounted) return;
        setErr(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="vstack">
      <h1 className="page-title">Learning Paths</h1>
      <p className="page-subtitle">Curated sequences of courses to master topics</p>

      {err && <div className="card" style={{ borderColor: "var(--color-error)" }}>Failed to load learning paths.</div>}
      {loading && <div className="card">Loading...</div>}

      <div className="grid cols-3" style={{ marginTop: 8 }}>
        {paths.map((p) => (
          <PathCard key={p.id} path={p} />
        ))}
        {paths.length === 0 && !loading && !err && <div className="card">No learning paths available.</div>}
      </div>
    </div>
  );
}
