import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// PUBLIC_INTERFACE
export default function Courses() {
  /** Lists courses directly via Supabase (simple variant). */
  const [courses, setCourses] = useState([]);

  useEffect(() => { loadCourses(); }, []);

  async function loadCourses() {
    const { data, error } = await supabase
      .from("courses")
      .select("*, learning_paths(title)");
    if (!error) setCourses(data || []);
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full p-6">
        <Navbar />
        <h1 className="text-3xl font-bold mb-6">Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-xl shadow-lg">
              {c.image_url && <img src={c.image_url} className="rounded-lg mb-4" alt="" />}
              <h2 className="text-xl font-bold">{c.title}</h2>
              <p className="text-gray-500">{c.duration}</p>
              {c.learning_paths && (
                <p className="text-sm text-blue-600">Path: {c.learning_paths.title}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
