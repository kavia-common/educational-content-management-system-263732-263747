import React from "react";
import "../components/layout.css";
import LearningPaths from "../components/LearningPaths";

/**
 * PUBLIC_INTERFACE
 * Dashboard: shows a header and the LearningPaths grid.
 */
export default function Dashboard() {
  return (
    <div className="vstack">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Explore learning paths to start your journey</p>

      <LearningPaths />
    </div>
  );
}
