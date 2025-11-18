import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "../components/layout.css";
import Modules from "../components/Modules";
import VideoPlayer from "../components/VideoPlayer";

/**
 * PUBLIC_INTERFACE
 * CourseModules: renders modules list for a course and plays video_url when available.
 */
export default function CourseModules() {
  const { id } = useParams();
  const [current, setCurrent] = useState(null);

  return (
    <div className="vstack">
      <h1 className="page-title">Course Modules</h1>
      <p className="page-subtitle">Browse modules and play content</p>

      <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <div className="card">
          <VideoPlayer url={current?.video_url} />
        </div>
        <div>
          <Modules courseId={id} onSelect={setCurrent} />
        </div>
      </div>
    </div>
  );
}
