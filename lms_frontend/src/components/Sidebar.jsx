import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Sidebar for simple LMS variant using Ocean Professional theme styles.
 */
export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-[var(--color-surface)] text-[var(--color-text)] p-6 fixed border-r border-gray-100 shadow">
      <h2 className="text-2xl font-bold mb-6">LMS Dashboard</h2>
      <nav className="flex flex-col gap-1">
        <Link className="px-3 py-2 rounded-lg hover:text-[var(--color-secondary)] hover:bg-gray-50 transition" to="/dashboard">Dashboard</Link>
        <Link className="px-3 py-2 rounded-lg hover:text-[var(--color-secondary)] hover:bg-gray-50 transition" to="/paths">Learning Paths</Link>
        <Link className="px-3 py-2 rounded-lg hover:text-[var(--color-secondary)] hover:bg-gray-50 transition" to="/courses">Courses</Link>
        <Link className="px-3 py-2 rounded-lg hover:text-[var(--color-secondary)] hover:bg-gray-50 transition" to="/signin">Sign In</Link>
      </nav>
    </div>
  );
}
