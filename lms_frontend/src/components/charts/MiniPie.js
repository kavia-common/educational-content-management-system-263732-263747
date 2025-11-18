import React from "react";

/**
 * Minimal SVG Pie chart without external deps.
 *
 * @param {Array<{name:string, value:number}>} data
 * @param {number} size
 */
 // PUBLIC_INTERFACE
export default function MiniPie({ data = [], size = 140 }) {
  const total = data.reduce((acc, d) => acc + (Number(d.value) || 0), 0) || 1;
  const radius = size / 2;
  const cx = radius;
  const cy = radius;
  let startAngle = -Math.PI / 2;

  const colors = [
    "var(--color-primary)",
    "var(--color-secondary)",
    "#10B981",
    "#8B5CF6",
    "#EF4444",
  ];

  // Helper to convert polar to cartesian
  const arcPath = (cx, cy, r, start, end) => {
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const largeArc = end - start > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <svg width={size} height={size} role="img" aria-label="Pie chart">
      <circle cx={cx} cy={cy} r={radius} fill="var(--color-surface)" />
      {data.map((d, i) => {
        const val = Number(d.value) || 0;
        const angle = (val / total) * Math.PI * 2;
        const endAngle = startAngle + angle;
        const path = arcPath(cx, cy, radius - 2, startAngle, endAngle);
        const color = colors[i % colors.length];
        startAngle = endAngle;
        return <path key={i} d={path} fill={color} stroke="white" strokeWidth="1" />;
      })}
      {/* Legend */}
      <g transform={`translate(${size + 8}, 0)`} />
    </svg>
  );
}
