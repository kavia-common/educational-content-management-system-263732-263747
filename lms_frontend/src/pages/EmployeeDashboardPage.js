import React from 'react';
import Card from '../components/ui/Card';
import Stat from '../components/ui/Stat';
import { useProgress } from '../hooks/useProgress';
import MiniBar from '../components/charts/MiniBar';
import MiniPie from '../components/charts/MiniPie';

/**
 * PUBLIC_INTERFACE
 * EmployeeDashboardPage
 * Dashboard for learners showing simple progress breakdown.
 */
export default function EmployeeDashboardPage() {
  const { completed, inProgress, notStarted, totalTracked, loading, error } = useProgress();

  const series = [
    { label: 'Completed', value: completed, color: '#2563EB' },
    { label: 'In Progress', value: inProgress, color: '#F59E0B' },
    { label: 'Not Started', value: notStarted, color: '#9CA3AF' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">My Learning</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Completed" value={completed} accent="blue" />
        <Stat label="In Progress" value={inProgress} accent="amber" />
        <Stat label="Tracked Lessons" value={totalTracked} />
      </div>

      <Card title="Progress Overview">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-600">Error loading progress</div>
        ) : totalTracked === 0 ? (
          <div className="text-gray-600">No progress yet. Start a course to see your stats.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MiniBar data={series} />
            <MiniPie data={series} />
          </div>
        )}
      </Card>
    </div>
  );
}
