import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Card from "./common/Card";

/**
 * PUBLIC_INTERFACE
 * Courses
 * Props:
 * - pathId: string - filter courses by path_id
 * Fetch fields: image_url, title, duration, difficulty
 */
export default function Courses({ pathId }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let query = supabase
          .from("courses")
          .select("id, title, description, image_url, duration, difficulty, path_id");
        if (pathId) {
          query = query.eq("path_id", pathId);
        }
        const { data, error } = await query;
        if (error) throw error;
        if (mounted) setCourses(Array.isArray(data) ? data : []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[Courses] fetch error", e);
        if (mounted) setErr(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [pathId]);

  const openCourse = (id) => navigate(`/courses/${id}`);

  return (
    <div>
      {err && (
        <Card>
          <div style={{ color: "var(--color-error)" }}>
            Failed to load courses.
          </div>
        </Card>
      )}
      {loading && <Card>Loading...</Card>}

      <div className="grid cols-3" style={{ marginTop: 8 }}>
        {courses.map((c) => (
          <Card key={c.id}>
            <div className="hstack" style={{ gap: 12 }}>
              {c.image_url ? (
                <img
                  src={c.image_url}
                  alt=""
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    objectFit: "cover",
                    border: "1px solid var(--color-border)",
                  }}
                />
              ) : (
                <div
                  aria-hidden
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    background:
                      "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(245,158,11,0.15))",
                    border: "1px solid var(--color-border)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--color-muted)",
                    fontWeight: 700,
                  }}
                >
                  {(c.title || "CO").slice(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "4px 0 6px" }}>{c.title || "Course"}</h3>
                <p className="page-subtitle" style={{ margin: 0 }}>
                  {c.description || "Learn something new"}
                </p>
                <div
                  className="hstack"
                  style={{ justifyContent: "space-between", marginTop: 8 }}
                >
                  <span className="page-subtitle" style={{ margin: 0 }}>
                    {c.duration ? `${c.duration} min` : "—"}
                  </span>
                  <span className="page-subtitle" style={{ margin: 0 }}>
                    {c.difficulty || ""}
                  </span>
                </div>
                <div className="hstack" style={{ marginTop: 10 }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => openCourse(c.id)}
                    aria-label={`Open course ${c.title || c.id}`}
                  >
                    Open Course
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {courses.length === 0 && !loading && !err && (
          <Card>No courses found.</Card>
        )}
      </div>
    </div>
  );
}
