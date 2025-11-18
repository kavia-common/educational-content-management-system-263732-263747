import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LearningPaths from "./pages/LearningPaths";
import Courses from "./pages/Courses";
import Modules from "./pages/Modules";
import SignIn from "./pages/SignIn";
import AuthRoute from "./components/AuthRoute.jsx";

// PUBLIC_INTERFACE
function App() {
  /** Simple LMS router variant using react-router-dom v6 with protected routes. */
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/dashboard" element={<AuthRoute><Dashboard /></AuthRoute>} />
        <Route path="/paths" element={<AuthRoute><LearningPaths /></AuthRoute>} />
        <Route path="/courses" element={<AuthRoute><Courses /></AuthRoute>} />
        <Route path="/courses/:courseId/modules" element={<AuthRoute><Modules /></AuthRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
