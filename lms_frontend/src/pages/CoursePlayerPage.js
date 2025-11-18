import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "../components/layout.css";
import { coursesService } from "../services/coursesService";
import ProgressBar from "../components/ProgressBar";
import { useDashboard } from "../context/DashboardContext";

/**
 * Plays a course's primary content (video or embedded resource)
 * and allows user to start and mark complete with optimistic updates.
 *
 * Endpoints:
 * - GET /api/courses/:id (fallback: /courses/:id)
 * - POST /api/courses/:id/start
 * - POST /api/courses/:id/complete
 */
// PUBLIC_INTERFACE
export default function CoursePlayerPage() {
  const { id } = useParams();
  const { markStarted, markCompleted } = useDashboard();
  const [course, setCourse] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await coursesService.get(id);
        if (!mounted) return;
        setCourse(data);
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

  const pct = Math.max(0, Math.min(100, Number(course?.progressPercent) || 0));
  const isComplete = useMemo(() => pct >= 100 || course?.status === "completed", [pct, course?.status]);

  const handleStart = async () => {
    if (working) return;
    setWorking(true);
    const prev = course;
    // Optimistic: set at least some progress
    setCourse((c) => ({ ...(c || {}), status: "in_progress", progressPercent: Math.max(5, Number(c?.progressPercent || 0)) }));
    try {
      await coursesService.start(id);
      // notify dashboards
      markStarted();
    } catch (e) {
      // rollback on error
      setCourse(prev);
      setErr(e);
    } finally {
      setWorking(false);
    }
  };

  const handleComplete = async () => {
    if (working || isComplete) return;
    setWorking(true);
    const prev = course;
    // Optimistic: mark as 100% and completed
    setCourse((c) => ({ ...(c || {}), status: "completed", progressPercent: 100 }));
    try {
      await coursesService.complete(id);
      // notify dashboards
      markCompleted();
    } catch (e) {
      // rollback on error
      setCourse(prev);
      setErr(e);
    } finally {
      setWorking(false);
    }
  };

  const renderPlayer = () => {
    const video = course?.video_url || course?.videoUrl;
    const embed = course?.embed_url || course?.embedHtml;
    if (video) {
      return (
        <video
          key={video}
          controls
          style={{ width: "100%", borderRadius: 12, border: "1px solid var(--color-border)", background: "black" }}
          src={video}
        />
      );
    }
    if (embed) {
      // If backend returns an embeddable URL, render iframe
      return (
        <iframe
          key={embed}
          title={course?.title || "Course"}
          src={embed}
          style={{ width: "100%", height: 420, border: "1px solid var(--color-border)", borderRadius: 12 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      );
    }
    return <div className="card">No playable media available for this course.</div>;
  };

  return (
    <div className="vstack">
      <h1 className="page-title">{course?.title || "Course"}</h1>
      <p className="page-subtitle">{course?.description || "Course player"}</p>

      {err && <div className="card" style={{ borderColor: "var(--color-error)" }}>A problem occurred. Please try again.</div>}
      {loading && <div className="card">Loading...</div>}

      {!loading && (
        <>
          <div className="card">{renderPlayer()}</div>

          <div className="card" style={{ marginTop: 12 }}>
            <div className="hstack" style={{ justifyContent: "space-between", marginBottom: 8 }}>
              <strong>Progress</strong>
              <span style={{ color: "var(--color-primary)" }}>{Math.round(pct)}%</span>
            </div>
            <ProgressBar value={pct} label="Course progress" />
            <div className="hstack" style={{ marginTop: 12, gap: 8 }}>
              <button className="btn btn-primary" onClick={handleStart} disabled={working}>
                {working ? "Starting..." : "Start"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleComplete}
                disabled={working || isComplete}
                aria-disabled={working || isComplete}
              >
                {isComplete ? "Completed" : working ? "Marking..." : "Mark Complete"}
              </button>
            </div>
          </div>

          {Array.isArray(course?.modules) && course.modules.length > 0 && (
            <div className="vstack" style={{ marginTop: 12 }}>
              <h3 className="page-title" style={{ fontSize: 18 }}>Modules</h3>
              <div className="grid">
                {(course.modules || []).map((m) => (
                  <div key={m.id} className="card">
                    <strong>{m.title}</strong>
                    <p className="page-subtitle">{m.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
