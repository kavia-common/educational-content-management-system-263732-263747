import React from "react";
import { NavLink } from "react-router-dom";
import "./layout.css";

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Sidebar navigation for main sections. */
  return (
    <aside className="sidebar">
      <nav>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "side-link active" : "side-link"}>
          Dashboard
        </NavLink>
        <NavLink to="/courses" className={({ isActive }) => isActive ? "side-link active" : "side-link"}>
          Courses
        </NavLink>
        <NavLink to="/assignments" className={({ isActive }) => isActive ? "side-link active" : "side-link"}>
          Assignments
        </NavLink>
        <NavLink to="/grades" className={({ isActive }) => isActive ? "side-link active" : "side-link"}>
          Grades
        </NavLink>
      </nav>
    </aside>
  );
}
