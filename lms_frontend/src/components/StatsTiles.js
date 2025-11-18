import React from "react";

/**
 * Reusable tiles grid for KPI stats
 *
 * @param {Array<{label:string, value:any, accent?:'primary'|'secondary'|'error'|'default'}>} items
 * @param {number} columns - number of columns (default 4)
 */
 // PUBLIC_INTERFACE
export default function StatsTiles({ items = [], columns = 4 }) {
  const gridClass = `grid cols-${Math.max(1, Math.min(4, columns))}`;
  const getColor = (accent) => {
    switch (accent) {
      case "primary":
        return "var(--color-primary)";
      case "secondary":
        return "var(--color-secondary)";
      case "error":
        return "var(--color-error)";
      default:
        return "var(--color-text)";
    }
  };

  return (
    <div className={gridClass} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
      {items.map((it, idx) => (
        <div key={idx} className="card">
          <div className="hstack" style={{ justifyContent: "space-between" }}>
            <strong>{it.label}</strong>
            <span style={{ color: getColor(it.accent) }}>{it.value ?? "—"}</span>
          </div>
        </div>
      ))}
      {items.length === 0 && <div className="card">No stats available.</div>}
    </div>
  );
}
