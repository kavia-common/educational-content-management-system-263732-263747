import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiJson } from "../apiClient";
import "../components/layout.css";

// PUBLIC_INTERFACE
export default function CourseDetailPage() {
  /** Detailed view for a single course. */
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiJson(`/courses/${id}`);
        if (mounted) setCourse(data);
      } catch (e) {
        setErr(e);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  return (
    <div className="vstack">
      <h1 className="page-title">{course?.title || "Course"}</h1>
      <p className="page-subtitle">{course?.description || "Course details and modules"}</p>

      {err && <div className="card" style={{ borderColor: "var(--color-error)" }}>Failed to load course.</div>}

      <div className="card">
        <strong>Instructor:</strong> {course?.instructor || "TBD"}
      </div>
      <div className="vstack">
        <h3 className="page-title" style={{ fontSize: 18 }}>Modules</h3>
        <div className="grid">
          {(course?.modules || []).map((m) => (
            <div key={m.id} className="card">
              <strong>{m.title}</strong>
              <p className="page-subtitle">{m.summary}</p>
            </div>
          ))}
          {(!course?.modules || course.modules.length === 0) && <div className="card">No modules yet.</div>}
        </div>
      </div>
    </div>
  );
}
