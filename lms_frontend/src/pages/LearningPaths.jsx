import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

/**
 * PUBLIC_INTERFACE
 * Learning Paths page with Ocean Professional styling and loading/error states.
 */
export default function LearningPaths() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => { fetchPaths(); }, []);

  async function fetchPaths() {
    setLoading(true);
    setErr(null);
    try {
      const { data, error } = await supabase.from("learning_paths").select("*");
      if (error) throw error;
      setPaths(data || []);
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
        <h1 className="text-3xl font-bold mb-1 text-[var(--color-text)]">Learning Paths</h1>
        <p className="text-[var(--color-muted)] mb-6">Curated sequences of courses</p>

        {loading && <div className="card p-4 text-[var(--color-muted)]">Loading...</div>}
        {err && (
          <div className="card p-4 border border-red-200 text-[var(--color-error)]">
            Failed to load learning paths.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paths.map((p) => (
            <div key={p.id} className="card p-4">
              {p.image_url && <img src={p.image_url} className="rounded-lg mb-4" alt="" />}
              <h2 className="text-xl font-bold text-[var(--color-text)]">{p.title}</h2>
              <p className="text-[var(--color-muted)]">{p.description}</p>
            </div>
          ))}
          {paths.length === 0 && !loading && !err && (
            <div className="card p-4 text-[var(--color-muted)]">No learning paths available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
