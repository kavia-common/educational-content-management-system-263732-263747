import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../components/layout.css";
import { pathsService } from "../services/pathsService";
import CourseCard from "../components/CourseCard";

/**
 * Shows a learning path details and its courses.
 *
 * Endpoints:
 * - GET /api/learning-paths/:id
 * - GET /api/learning-paths/:id/courses
 */
// PUBLIC_INTERFACE
export default function PathDetailPage() {
  const { id } = useParams();
  const [path, setPath] = useState(null);
  const [courses, setCourses] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, c] = await Promise.all([
          pathsService.get(id),
          pathsService.getCourses(id),
        ]);
        if (!mounted) return;
        setPath(p);
        setCourses(Array.isArray(c) ? c : c?.items || []);
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
  }, [id]);

  return (
    <div className="vstack">
      <div className="hstack" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h1 className="page-title">{path?.title || "Learning Path"}</h1>
          <p className="page-subtitle">{path?.description || "Courses in this path"}</p>
        </div>
        <Link to="/paths" className="btn btn-secondary">All Paths</Link>
      </div>

      {err && <div className="card" style={{ borderColor: "var(--color-error)" }}>Failed to load path.</div>}
      {loading && <div className="card">Loading...</div>}

      <div className="grid cols-3" style={{ marginTop: 8 }}>
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} ctaLabel="Start" />
        ))}
        {courses.length === 0 && !loading && !err && <div className="card">No courses in this path.</div>}
      </div>
    </div>
  );
}
