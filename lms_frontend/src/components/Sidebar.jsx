import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Sidebar for simple LMS variant using Ocean Professional theme styles.
 */
export default function Sidebar() {
  return (
    <aside className="w-64 h-screen ocean-sidebar p-6 fixed border-r border-slate-800/40 shadow-ocean" aria-label="Primary navigation">
      <h2 className="text-2xl font-bold mb-6 text-white">LMS Dashboard</h2>
      <nav className="flex flex-col gap-1">
        <Link className="ocean-sidebar-link focus-visible:ring-2 focus-visible:ring-primary/60" to="/dashboard">Dashboard</Link>
        <Link className="ocean-sidebar-link focus-visible:ring-2 focus-visible:ring-primary/60" to="/paths">Learning Paths</Link>
        <Link className="ocean-sidebar-link focus-visible:ring-2 focus-visible:ring-primary/60" to="/courses">Courses</Link>
        <Link className="ocean-sidebar-link focus-visible:ring-2 focus-visible:ring-primary/60" to="/signin">Sign In</Link>
      </nav>
    </aside>
  );
}
