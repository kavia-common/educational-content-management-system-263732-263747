import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LearningPaths from "./pages/LearningPaths";
import Courses from "./pages/Courses";
import Modules from "./pages/Modules";
import SignIn from "./pages/SignIn";

// PUBLIC_INTERFACE
function App() {
  /** Simple LMS router variant using react-router-dom v6. */
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/paths" element={<LearningPaths />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId/modules" element={<Modules />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
