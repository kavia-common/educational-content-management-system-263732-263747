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
      <div className="ml-64 w-full p-6 bg-gradient-to-b from-blue-500/10 to-gray-50 min-h-screen">
        <Navbar />
        <h1 className="text-3xl font-bold mb-4 text-[var(--color-text)]">Dashboard Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-8">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Learning Paths</h2>
            <p className="text-3xl mt-2 text-[var(--color-primary)]">10</p>
          </div>
          <div className="card p-8">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Courses</h2>
            <p className="text-3xl mt-2 text-[var(--color-secondary)]">40+</p>
          </div>
          <div className="card p-8">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Employees</h2>
            <p className="text-3xl mt-2 text-[var(--color-primary)]">120</p>
          </div>
        </div>
      </div>
    </div>
  );
}
