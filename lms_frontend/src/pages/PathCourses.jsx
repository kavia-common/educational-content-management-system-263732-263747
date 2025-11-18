import React from "react";
import { useParams } from "react-router-dom";
import "../components/layout.css";
import Courses from "../components/Courses";

/**
 * PUBLIC_INTERFACE
 * PathCourses: renders courses for a learning path (/:id)
 */
export default function PathCourses() {
  const { id } = useParams();
  return (
    <div className="vstack">
      <h1 className="page-title">Path Courses</h1>
      <p className="page-subtitle">Courses in this learning path</p>

      <Courses pathId={id} />
    </div>
  );
}
