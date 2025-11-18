import React from "react";
import { NavLink } from "react-router-dom";
import "./layout.css";

/**
 * PUBLIC_INTERFACE
 * Sidebar
 * Navigation with main and admin/authoring sections.
 */
export default function Sidebar() {
  const linkClass = ({ isActive }) => (isActive ? "side-link active" : "side-link");
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <nav>
        <NavLink to="/employee/dashboard" className={linkClass}>My Dashboard</NavLink>
        <NavLink to="/paths" className={linkClass}>Learning Paths</NavLink>
        <NavLink to="/courses" className={linkClass}>Courses</NavLink>

        <div className="page-subtitle" style={{ margin: "12px 8px 4px", color: "#8FA0B8" }}>Admin</div>
        <NavLink to="/admin/dashboard" className={linkClass}>Overview</NavLink>
        <NavLink to="/authoring/paths" className={linkClass}>Paths</NavLink>
        <NavLink to="/authoring/courses" className={linkClass}>Courses</NavLink>
        <NavLink to="/authoring/lessons" className={linkClass}>Lessons</NavLink>
      </nav>
    </aside>
  );
}
