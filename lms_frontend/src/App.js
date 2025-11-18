import React, { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import GradesPage from "./pages/GradesPage";
import EmployeeDashboardPage from "./pages/EmployeeDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import PathsListPage from "./pages/PathsListPage";
import PathDetailPage from "./pages/PathDetailPage";
import CoursePlayerPage from "./pages/CoursePlayerPage";
import { applyCssVariables } from "./theme";
import "./App.css";
import "./styles/theme.css";
import { DashboardProvider } from "./context/DashboardContext";
import PathsAuthoringPage from "./pages/authoring/PathsAuthoringPage";
import CoursesAuthoringPage from "./pages/authoring/CoursesAuthoringPage";
import { FeatureFlagsProvider } from "./context/FeatureFlagsContext";
import HealthPage from "./pages/HealthPage";
import Dashboard from "./pages/Dashboard";
import PathCourses from "./pages/PathCourses";
import CourseModules from "./pages/CourseModules";

/**
 * In guest mode, all routes are public. Admin/Authoring routes are accessible
 * to the default guest profile to keep demo pages reachable.
 */

// PUBLIC_INTERFACE
function App() {
  /** Main app entry: sets theme variables and declares routes. */
  useEffect(() => {
    applyCssVariables();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <FeatureFlagsProvider>
          <DashboardProvider>
            <Routes>
              <Route
                path="/"
                element={
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                }
              />
              <Route
                path="/employee/dashboard"
                element={
                  <AppLayout>
                    <EmployeeDashboardPage />
                  </AppLayout>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <AppLayout>
                    <AdminDashboardPage />
                  </AppLayout>
                }
              />

              {/* Learning Paths */}
              <Route
                path="/paths"
                element={
                  <AppLayout>
                    <PathsListPage />
                  </AppLayout>
                }
              />
              <Route
                path="/paths/:id"
                element={
                  <AppLayout>
                    <PathCourses />
                  </AppLayout>
                }
              />

              {/* Courses */}
              <Route
                path="/courses"
                element={
                  <AppLayout>
                    <CoursesPage />
                  </AppLayout>
                }
              />
              {/* Player route for course content */}
              <Route
                path="/courses/:id"
                element={
                  <AppLayout>
                    <CourseModules />
                  </AppLayout>
                }
              />

              {/* Authoring */}
              <Route
                path="/authoring/paths"
                element={
                  <AppLayout>
                    <PathsAuthoringPage />
                  </AppLayout>
                }
              />
              <Route
                path="/authoring/courses"
                element={
                  <AppLayout>
                    <CoursesAuthoringPage />
                  </AppLayout>
                }
              />

              {/* Other sections */}
              <Route
                path="/assignments"
                element={
                  <AppLayout>
                    <AssignmentsPage />
                  </AppLayout>
                }
              />
              <Route
                path="/grades"
                element={
                  <AppLayout>
                    <GradesPage />
                  </AppLayout>
                }
              />
              {/* Health/status page - public, no secrets */}
              <Route path={process.env.REACT_APP_HEALTHCHECK_PATH || "/health"} element={<HealthPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </DashboardProvider>
        </FeatureFlagsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
