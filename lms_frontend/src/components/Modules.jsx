import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Card from "./common/Card";

/**
 * PUBLIC_INTERFACE
 * Modules
 * Props:
 * - courseId: string - filter modules by course_id
 * Displays list of module titles. Assumes table 'modules' with fields: id, course_id, title, video_url (optional)
 */
export default function Modules({ courseId, onSelect }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!courseId) {
          setModules([]);
          return;
        }
        const { data, error } = await supabase
          .from("modules")
          .select("id, course_id, title, video_url")
          .eq("course_id", courseId)
          .order("id", { ascending: true });
        if (error) throw error;
        if (mounted) setModules(Array.isArray(data) ? data : []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[Modules] fetch error", e);
        if (mounted) setErr(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [courseId]);

  return (
    <div>
      {err && (
        <Card>
          <div style={{ color: "var(--color-error)" }}>
            Failed to load modules.
          </div>
        </Card>
      )}
      {loading && <Card>Loading...</Card>}

      <div className="vstack" style={{ gap: 8, marginTop: 8 }}>
        {modules.map((m) => (
          <Card key={m.id}>
            <div className="hstack" style={{ justifyContent: "space-between" }}>
              <div>
                <strong>{m.title || "Module"}</strong>
              </div>
              {onSelect && (m.video_url ? (
                <button
                  className="btn btn-secondary"
                  onClick={() => onSelect(m)}
                  aria-label={`Play ${m.title}`}
                >
                  Play
                </button>
              ) : null)}
            </div>
          </Card>
        ))}
        {modules.length === 0 && !loading && !err && (
          <Card>No modules found for this course.</Card>
        )}
      </div>
    </div>
  );
}
