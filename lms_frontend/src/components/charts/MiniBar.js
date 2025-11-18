import React from "react";

/**
 * Minimal SVG Bar chart without external deps.
 *
 * @param {Array<{label:string, value:number}>} data
 * @param {number} height
 */
 // PUBLIC_INTERFACE
export default function MiniBar({ data = [], height = 120 }) {
  const values = data.map((d) => Number(d.value) || 0);
  const max = Math.max(1, ...values);
  const barGap = 8;
  const barWidth = 24;
  const width = data.length * (barWidth + barGap) + barGap;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Bar chart">
      <rect x="0" y="0" width={width} height={height} fill="var(--color-surface)" />
      {data.map((d, i) => {
        const h = (values[i] / max) * (height - 24);
        const x = barGap + i * (barWidth + barGap);
        const y = height - h - 16;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={h}
              fill="var(--color-primary)"
              rx="6"
              ry="6"
            />
            <text
              x={x + barWidth / 2}
              y={height - 4}
              fontSize="10"
              fill="var(--color-muted)"
              textAnchor="middle"
            >
              {d.label?.slice(0, 6)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
