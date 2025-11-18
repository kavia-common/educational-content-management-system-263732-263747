import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

/**
 * PUBLIC_INTERFACE
 * Simple dashboard tiles with Ocean Professional styling.
 */
export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full p-6 bg-ocean-gradient min-h-screen">
        <Navbar />
        <header className="mb-4">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Dashboard Overview</h1>
          <p className="text-[var(--color-muted)]">Quick stats at a glance</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-8 hover:shadow-ocean-lg transition-shadow">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Learning Paths</h2>
            <p className="text-3xl mt-2 text-[var(--color-primary)]">10</p>
          </div>
          <div className="card p-8 hover:shadow-ocean-lg transition-shadow">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Courses</h2>
            <p className="text-3xl mt-2 text-[var(--color-secondary)]">40+</p>
          </div>
          <div className="card p-8 hover:shadow-ocean-lg transition-shadow">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Employees</h2>
            <p className="text-3xl mt-2 text-[var(--color-primary)]">120</p>
          </div>
        </div>
      </div>
    </div>
  );
}
