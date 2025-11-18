import { Link } from "react-router-dom";

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Minimal sidebar navigation used by the simple LMS variant pages. */
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-6 fixed">
      <h2 className="text-2xl font-bold mb-6">LMS Dashboard</h2>
      <nav className="flex flex-col gap-4">
        <Link className="hover:text-yellow-400" to="/dashboard">Dashboard</Link>
        <Link className="hover:text-yellow-400" to="/paths">Learning Paths</Link>
        <Link className="hover:text-yellow-400" to="/courses">Courses</Link>
        <Link className="hover:text-yellow-400" to="/signin">Sign In</Link>
      </nav>
    </div>
  );
}
