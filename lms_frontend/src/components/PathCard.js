import React from "react";
import { Link } from "react-router-dom";
import "./layout.css";

/**
 * Displays a Learning Path summary card.
 *
 * @param {Object} props
 * @param {{id:string,title:string,description?:string,coursesCount?:number,progressPercent?:number,thumbnail_url?:string}} props.path
 * @param {string} [props.ctaLabel] - CTA button label
 */
// PUBLIC_INTERFACE
export default function PathCard({ path, ctaLabel = "View Path" }) {
  const pct = Math.max(0, Math.min(100, Number(path?.progressPercent) || 0));
  const title = path?.title || "Learning Path";
  return (
    <div className="card">
      <div className="hstack" style={{ gap: 12 }}>
        {path?.thumbnail_url ? (
          <img
            src={path.thumbnail_url}
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
            {String(title || "LP").slice(0, 2).toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "4px 0 6px" }}>{title}</h3>
          <p className="page-subtitle" style={{ margin: 0 }}>
            {path?.description || "Curated set of courses"}
          </p>
          <div className="hstack" style={{ justifyContent: "space-between", marginTop: 8 }}>
            <span className="page-subtitle" style={{ margin: 0 }}>
              {typeof path?.coursesCount === "number" ? `${path.coursesCount} courses` : ""}
            </span>
            {typeof pct === "number" && !Number.isNaN(pct) ? (
              <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>{Math.round(pct)}%</span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="hstack" style={{ marginTop: 12 }}>
        <Link className="btn btn-primary" to={`/paths/${path?.id || ""}`} aria-label={`${ctaLabel} ${title}`}>
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
