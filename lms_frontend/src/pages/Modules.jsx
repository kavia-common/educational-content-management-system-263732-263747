import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";

// PUBLIC_INTERFACE
export default function Modules() {
  /** Lists modules for a course via Supabase (simple variant). */
  const { courseId } = useParams();
  const [modules, setModules] = useState([]);

  useEffect(() => { fetchModules(); }, [courseId]);

  async function fetchModules() {
    if (!courseId) return;
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", courseId);
    if (!error) setModules(data || []);
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full p-6">
        <Navbar />
        <h1 className="text-3xl font-bold mb-6">Modules</h1>
        <ul className="bg-white p-6 rounded-xl shadow-lg">
          {modules.map((m) => (
            <li key={m.id} className="p-3 border-b">{m.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
