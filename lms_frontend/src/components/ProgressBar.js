import React from "react";

/**
 * Simple accessible progress bar.
 *
 * @param {number} value - percentage value from 0 to 100
 * @param {string} color - CSS color or CSS variable reference
 * @param {string} label - Optional aria-label / visible label
 */
 // PUBLIC_INTERFACE
export default function ProgressBar({ value = 0, color = "var(--color-primary)", label }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label || "progress"}
      style={{
        width: "100%",
        height: 12,
        borderRadius: 999,
        overflow: "hidden",
        outline: "2px solid transparent",
        outlineOffset: 2,
        background: "linear-gradient(180deg, rgba(37,99,235,0.08), rgba(37,99,235,0.04))",
      }}
      tabIndex={0}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: color,
          transition: "width .25s ease",
        }}
      />
    </div>
  );
}
