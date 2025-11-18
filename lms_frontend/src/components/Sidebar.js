import React from "react";
import { NavLink } from "react-router-dom";
import "./layout.css";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Sidebar navigation for main sections. */
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <nav>
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
          Dashboard
        </NavLink>
        <NavLink to="/employee/dashboard" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
          Employee Dashboard
        </NavLink>
        {user?.role === "admin" && (
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
      </nav>
    </aside>
  );
}
