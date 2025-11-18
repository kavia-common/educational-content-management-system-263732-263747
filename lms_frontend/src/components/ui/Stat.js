import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Stat
 * Displays a labeled metric value.
 */
export default function Stat({ label, value, accent = 'blue' }) {
  /** Stat tile component */
  const color = accent === 'amber' ? 'text-amber-600' : accent === 'red' ? 'text-red-600' : 'text-blue-600';
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
