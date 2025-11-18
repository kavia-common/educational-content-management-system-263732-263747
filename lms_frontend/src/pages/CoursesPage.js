import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiJson } from "../apiClient";
import "../components/layout.css";

// PUBLIC_INTERFACE
export default function CoursesPage() {
  /** Browse list of courses. */
  const [courses, setCourses] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiJson("/courses");
        if (mounted) setCourses(Array.isArray(data) ? data : (data?.items || []));
      } catch (e) {
        setErr(e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="vstack">
      <h1 className="page-title">Courses</h1>
      <p className="page-subtitle">Your enrolled courses</p>

      {err && <div className="card" style={{ borderColor: "var(--color-error)" }}>Failed to load courses.</div>}

      <div className="grid cols-3">
        {courses.map((c) => (
          <div key={c.id} className="card">
            <h3 style={{ margin: "4px 0 6px" }}>{c.title || "Untitled course"}</h3>
            <p className="page-subtitle" style={{ margin: 0 }}>{c.description || "No description"}</p>
            <div className="hstack" style={{ marginTop: 12 }}>
              <Link className="btn btn-primary" to={`/courses/${c.id}`}>Open</Link>
            </div>
          </div>
        ))}
        {courses.length === 0 && !err && <div className="card">No courses found.</div>}
      </div>
    </div>
  );
}
