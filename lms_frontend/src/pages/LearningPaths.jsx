import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// PUBLIC_INTERFACE
export default function LearningPaths() {
  /** Lists learning paths directly from Supabase (simple variant). */
  const [paths, setPaths] = useState([]);

  useEffect(() => { fetchPaths(); }, []);

  async function fetchPaths() {
    const { data, error } = await supabase.from("learning_paths").select("*");
    if (!error) setPaths(data || []);
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full p-6">
        <Navbar />
        <h1 className="text-3xl font-bold mb-6">Learning Paths</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paths.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-xl shadow-lg">
              {p.image_url && <img src={p.image_url} className="rounded-lg mb-4" alt="" />}
              <h2 className="text-xl font-bold">{p.title}</h2>
              <p className="text-gray-600">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
