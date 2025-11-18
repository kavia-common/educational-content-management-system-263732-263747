import React from "react";
import { Link } from "react-router-dom";
import "./layout.css";
import ProgressBar from "./ProgressBar";

/**
 * Displays a Course summary card.
 *
 * @param {Object} props
 * @param {{id:string,title:string,description?:string,instructor?:string,progressPercent?:number,thumbnail_url?:string}} props.course
 * @param {string} [props.ctaLabel] - CTA button label
 */
// PUBLIC_INTERFACE
export default function CourseCard({ course, ctaLabel = "Open Course" }) {
  const pct = Math.max(0, Math.min(100, Number(course?.progressPercent) || 0));
  const title = course?.title || "Course";
  return (
    <div className="card">
      <div className="hstack" style={{ gap: 12 }}>
        {course?.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt=""
            style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", border: "1px solid var(--color-border)" }}
          />
        ) : (
          <div
            aria-hidden
            style={{
              width: 64,
              height: 64,
              borderRadius: 8,
              background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(245,158,11,0.15))",
              border: "1px solid var(--color-border)",
              display: "grid",
              placeItems: "center",
              color: "var(--color-muted)",
              fontWeight: 700,
            }}
          >
            {String(title || "CO").slice(0, 2).toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "4px 0 6px" }}>{title}</h3>
          <p className="page-subtitle" style={{ margin: 0 }}>
            {course?.description || "Learn something new"}
          </p>
          <div className="hstack" style={{ justifyContent: "space-between", marginTop: 8 }}>
            <span className="page-subtitle" style={{ margin: 0 }}>{course?.instructor || ""}</span>
            <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>{Math.round(pct)}%</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <ProgressBar value={pct} label={`Progress for ${title}`} />
          </div>
        </div>
      </div>
      <div className="hstack" style={{ marginTop: 12 }}>
        <Link className="btn btn-primary" to={`/courses/${course?.id || ""}`} aria-label={`${ctaLabel} ${title}`}>
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
