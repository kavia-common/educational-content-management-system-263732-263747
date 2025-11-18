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
import { DashboardProvider } from "./context/DashboardContext";
import PathsAuthoringPage from "./pages/authoring/PathsAuthoringPage";
import CoursesAuthoringPage from "./pages/authoring/CoursesAuthoringPage";
import { FeatureFlagsProvider } from "./context/FeatureFlagsContext";
import HealthPage from "./pages/HealthPage";
import AuthRoute from "./components/AuthRoute.jsx";

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
                    <DashboardPage />
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

              {/* Learning Paths (protected) */}
              <Route
                path="/paths"
                element={
                  <AuthRoute>
                    <AppLayout>
                      <PathsListPage />
                    </AppLayout>
                  </AuthRoute>
                }
              />
              <Route
                path="/paths/:id"
                element={
                  <AuthRoute>
                    <AppLayout>
                      <PathDetailPage />
                    </AppLayout>
                  </AuthRoute>
                }
              />

              {/* Courses (protected) */}
              <Route
                path="/courses"
                element={
                  <AuthRoute>
                    <AppLayout>
                      <CoursesPage />
                    </AppLayout>
                  </AuthRoute>
                }
              />
              {/* Player route for course content (protected) */}
              <Route
                path="/courses/:id"
                element={
                  <AuthRoute>
                    <AppLayout>
                      <CoursePlayerPage />
                    </AppLayout>
                  </AuthRoute>
                }
              />

              {/* Authoring (leave public in guest mode) */}
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

              {/* Other sections (protected per request) */}
              <Route
                path="/assignments"
                element={
                  <AuthRoute>
                    <AppLayout>
                      <AssignmentsPage />
                    </AppLayout>
                  </AuthRoute>
                }
              />
              <Route
                path="/grades"
                element={
                  <AuthRoute>
                    <AppLayout>
                      <GradesPage />
                    </AppLayout>
                  </AuthRoute>
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
