import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Modules page - lists modules for a given courseId with Ocean Professional styling,
 * loading and error states.
 */
export default function Modules() {
  const { courseId } = useParams();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => { fetchModules(); }, [courseId]);

  async function fetchModules() {
    if (!courseId) return;
    setLoading(true);
    setErr(null);
    try {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId);
      if (error) throw error;
      setModules(data || []);
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
        <h1 className="text-3xl font-bold mb-2 text-[var(--color-text)]">Modules</h1>
        <p className="text-[var(--color-muted)] mb-6">Course content breakdown</p>

        {loading && <div className="card p-4 text-[var(--color-muted)]">Loading...</div>}
        {err && (
          <div className="card p-4 border border-red-200 text-[var(--color-error)]">
            Failed to load modules. Please try again later.
          </div>
        )}

        <ul className="card p-0 overflow-hidden">
          {modules.map((m) => (
            <li key={m.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--color-text)]">{m.title}</span>
                <span className="badge">Module</span>
              </div>
            </li>
          ))}
          {modules.length === 0 && !loading && !err && (
            <li className="p-4 text-[var(--color-muted)]">No modules found for this course.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
