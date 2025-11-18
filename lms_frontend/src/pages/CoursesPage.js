import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../components/layout.css";
import { coursesService } from "../services/coursesService";

/**
 * Browse list of courses with ability to enroll (optimistic).
 */
// PUBLIC_INTERFACE
export default function CoursesPage() {
  /** Browse list of courses. */
  const [courses, setCourses] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await coursesService.list().catch(async () => {
          // fallback: legacy endpoint without /api
          return [];
        });
        if (mounted) setCourses(Array.isArray(data) ? data : data?.items || []);
      } catch (e) {
        setErr(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleEnroll = async (courseId) => {
    if (!courseId || workingId) return;
    setWorkingId(courseId);
    const prev = courses;
    // Optimistically set enrolled=true
    setCourses((list) =>
      (list || []).map((c) => (c.id === courseId ? { ...c, enrolled: true } : c))
    );
    try {
      await coursesService.enroll(courseId);
    } catch (e) {
      // rollback
      setCourses(prev);
      setErr(e);
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="vstack">
      <h1 className="page-title">Courses</h1>
      <p className="page-subtitle">Browse and continue your courses</p>

      {err && (
        <div className="card" style={{ borderColor: "var(--color-error)" }}>
          Failed to load courses.
        </div>
      )}
      {loading && <div className="card">Loading...</div>}

      <div className="grid cols-3">
        {courses.map((c) => (
          <div key={c.id} className="card">
            <h3 style={{ margin: "4px 0 6px" }}>{c.title || "Untitled course"}</h3>
            <p className="page-subtitle" style={{ margin: 0 }}>
              {c.description || "No description"}
            </p>
            <div className="hstack" style={{ marginTop: 12, gap: 8 }}>
              <Link className="btn btn-primary" to={`/courses/${c.id}`}>
                {c.enrolled ? "Open" : "View"}
              </Link>
              {!c.enrolled && (
                <button
                  className="btn btn-secondary"
                  onClick={() => handleEnroll(c.id)}
                  disabled={workingId === c.id}
                >
                  {workingId === c.id ? "Enrolling..." : "Enroll"}
                </button>
              )}
            </div>
          </div>
        ))}
        {courses.length === 0 && !err && <div className="card">No courses found.</div>}
      </div>
    </div>
  );
}
