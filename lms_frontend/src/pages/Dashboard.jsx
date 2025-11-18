import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

// PUBLIC_INTERFACE
export default function Dashboard() {
  /** Simple dashboard tiles for the requested LMS variant. */
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full p-6">
        <Navbar />
        <h1 className="text-3xl font-bold mb-4">Dashboard Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-500 text-white p-8 rounded-xl shadow-xl">
            <h2 className="text-xl font-bold">Learning Paths</h2>
            <p className="text-3xl mt-2">10</p>
          </div>
          <div className="bg-green-500 text-white p-8 rounded-xl shadow-xl">
            <h2 className="text-xl font-bold">Courses</h2>
            <p className="text-3xl mt-2">40+</p>
          </div>
          <div className="bg-purple-500 text-white p-8 rounded-xl shadow-xl">
            <h2 className="text-xl font-bold">Employees</h2>
            <p className="text-3xl mt-2">120</p>
          </div>
        </div>
      </div>
    </div>
  );
}
