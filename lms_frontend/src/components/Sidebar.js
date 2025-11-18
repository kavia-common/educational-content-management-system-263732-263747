import React from "react";
import { NavLink } from "react-router-dom";
import "./layout.css";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Sidebar navigation for main sections (role-aware authoring links). */
  const { user } = useAuth();
  const isAuthed = !!user;
  const isAdmin = user?.role === "admin";
  const canAuthor = isAdmin || user?.role === "instructor";

  return (
    <aside className="sidebar" aria-label="Primary">
      <nav aria-live="polite" aria-busy={!isAuthed ? "true" : "false"}>
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
          Dashboard
        </NavLink>
        <NavLink to="/employee/dashboard" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
          Employee Dashboard
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
            Admin Dashboard
          </NavLink>
        )}
        <NavLink to="/paths" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
          Learning Paths
        </NavLink>
        <NavLink to="/courses" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
          Courses
        </NavLink>
        <NavLink to="/assignments" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
          Assignments
        </NavLink>
        <NavLink to="/grades" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
          Grades
        </NavLink>

        {isAuthed && canAuthor && (
          <>
            <div className="page-subtitle" style={{ margin: "12px 8px 4px", color: "#8FA0B8" }}>
              Authoring
            </div>
            <NavLink to="/authoring/paths" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
              Manage Paths
            </NavLink>
            <NavLink to="/authoring/courses" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
              Manage Courses
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
