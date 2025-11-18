import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

/**
 * PUBLIC_INTERFACE
 * Courses simple variant with Ocean Professional styling and link to modules.
 */
export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => { loadCourses(); }, []);

  async function loadCourses() {
    setLoading(true);
    setErr(null);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*, learning_paths(title)");
      if (error) throw error;
      setCourses(data || []);
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full p-6 bg-gradient-to-b from-blue-500/10 to-gray-50 min-h-screen">
        <Navbar />
        <h1 className="text-3xl font-bold mb-1 text-[var(--color-text)]">Courses</h1>
        <p className="text-[var(--color-muted)] mb-6">Browse and open modules</p>

        {loading && <div className="card p-4 text-[var(--color-muted)]">Loading...</div>}
        {err && (
          <div className="card p-4 border border-red-200 text-[var(--color-error)]">
            Failed to load courses.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div key={c.id} className="card p-5">
              {c.image_url && <img src={c.image_url} className="rounded-lg mb-4" alt="" />}
              <h2 className="text-xl font-bold text-[var(--color-text)]">{c.title}</h2>
              <p className="text-[var(--color-muted)]">{c.duration}</p>
              {c.learning_paths && (
                <p className="text-sm text-[var(--color-primary)]">Path: {c.learning_paths.title}</p>
              )}
              <div className="flex gap-2 mt-3">
                <Link className="btn btn-primary" to={`/courses/${c.id}/modules`} aria-label={`Open modules for ${c.title}`}>
                  View Modules
                </Link>
                <Link className="btn btn-secondary" to={`/courses/${c.id}`} aria-label={`Open course player for ${c.title}`}>
                  Open Player
                </Link>
              </div>
            </div>
          ))}
          {courses.length === 0 && !loading && !err && (
            <div className="card p-4 text-[var(--color-muted)]">No courses found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
