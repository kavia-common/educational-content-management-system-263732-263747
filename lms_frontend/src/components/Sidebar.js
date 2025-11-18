import React from "react";
import { NavLink } from "react-router-dom";
import "./layout.css";

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Sidebar navigation for main sections; always visible in guest mode. */
  const linkClass = ({ isActive }) => (isActive ? "side-link active" : "side-link");

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <nav>
        <NavLink to="/dashboard" className={linkClass} aria-label="Dashboard">
          Dashboard
        </NavLink>
        <NavLink to="/employee/dashboard" className={linkClass} aria-label="Employee Dashboard">
          Employee Dashboard
        </NavLink>
        <NavLink to="/admin/dashboard" className={linkClass} aria-label="Admin Dashboard">
          Admin Dashboard
        </NavLink>
        <NavLink to="/paths" className={linkClass} aria-label="Learning Paths">
          Learning Paths
        </NavLink>
        <NavLink to="/courses" className={linkClass} aria-label="Courses">
          Courses
        </NavLink>
        <NavLink to="/assignments" className={linkClass} aria-label="Assignments">
          Assignments
        </NavLink>
        <NavLink to="/grades" className={linkClass} aria-label="Grades">
          Grades
        </NavLink>

        <div className="page-subtitle" style={{ margin: "12px 8px 4px", color: "#8FA0B8" }}>
          Authoring
        </div>
        <NavLink to="/authoring/paths" className={linkClass} aria-label="Manage Paths">
          Manage Paths
        </NavLink>
        <NavLink to="/authoring/courses" className={linkClass} aria-label="Manage Courses">
          Manage Courses
        </NavLink>
        <NavLink to="/authoring/lessons" className={linkClass} aria-label="Manage Lessons">
          Manage Lessons
        </NavLink>
        <NavLink to={process.env.REACT_APP_HEALTHCHECK_PATH || "/health"} className={linkClass} aria-label="System Health">
          System Health
        </NavLink>
      </nav>
    </aside>
  );
}
