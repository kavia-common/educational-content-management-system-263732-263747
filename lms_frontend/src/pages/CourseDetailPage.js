import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../components/layout.css";
import { coursesService } from "../services/coursesService";

// PUBLIC_INTERFACE
export default function CourseDetailPage() {
  /** Detailed view for a single course. */
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [err, setErr] = useState(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await coursesService.get(id);
        if (mounted) setCourse(data);
      } catch (e) {
        setErr(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleEnroll = async () => {
    if (working) return;
    setWorking(true);
    const prev = course;
    setCourse((c) => ({ ...(c || {}), enrolled: true }));
    try {
      await coursesService.enroll(id);
    } catch (e) {
      setCourse(prev);
      setErr(e);
    } finally {
      setWorking(false);
    }
  };

  const handleStart = async () => {
    if (working) return;
    setWorking(true);
    const prev = course;
    setCourse((c) => ({ ...(c || {}), status: "in_progress", progressPercent: Math.max(5, Number(c?.progressPercent || 0)) }));
    try {
      await coursesService.start(id);
    } catch (e) {
      setCourse(prev);
      setErr(e);
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="vstack">
      <div className="hstack" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h1 className="page-title">{course?.title || "Course"}</h1>
          <p className="page-subtitle">{course?.description || "Course details and modules"}</p>
        </div>
        <Link to="/courses" className="btn btn-secondary">All Courses</Link>
      </div>

      {err && <div className="card" style={{ borderColor: "var(--color-error)" }}>Failed to load course.</div>}

      <div className="card">
        <div className="hstack" style={{ justifyContent: "space-between", marginBottom: 8 }}>
          <span><strong>Instructor:</strong> {course?.instructor || "TBD"}</span>
          <div className="hstack" style={{ gap: 8 }}>
            {!course?.enrolled && (
              <button className="btn btn-secondary" onClick={handleEnroll} disabled={working}>
                {working ? "Enrolling..." : "Enroll"}
              </button>
            )}
            <Link className="btn btn-primary" to={`/courses/${id}`}>Open Player</Link>
            <button className="btn btn-secondary" onClick={handleStart} disabled={working}>
              {working ? "Starting..." : "Start"}
            </button>
          </div>
        </div>
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
