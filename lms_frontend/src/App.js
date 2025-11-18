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
import LessonsAuthoringPage from "./pages/authoring/LessonsAuthoringPage";
import { FeatureFlagsProvider } from "./context/FeatureFlagsContext";
import HealthPage from "./pages/HealthPage";
import LoginPage from "./pages/LoginPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import { ProtectedRoute, RequireRole } from "./routes/guards";
import { isSupabaseMode } from "./lib/supabaseClient";

/**
 * Application routes:
 * - When Supabase mode is enabled, protect main app with ProtectedRoute and use RequireRole for admin routes.
 * - Otherwise, guest mode is permissive (existing behavior).
 */

// PUBLIC_INTERFACE
function App() {
  /** Main app entry: sets theme variables and declares routes. */
  useEffect(() => {
    applyCssVariables();
  }, []);

  const supabaseMode = (() => {
    try {
      return isSupabaseMode();
    } catch {
      return false;
    }
  })();

  // eslint-disable-next-line no-console
  console.debug("[App] render, supabaseMode:", supabaseMode);

  const maybeProtect = (element) =>
    supabaseMode ? <ProtectedRoute>{element}</ProtectedRoute> : element;

  const maybeAdmin = (element) =>
    supabaseMode ? (
      <ProtectedRoute>
        <RequireRole roles={["admin", "instructor"]}>{element}</RequireRole>
      </ProtectedRoute>
    ) : (
      element
    );

  return (
    <BrowserRouter>
      <AuthProvider>
        <FeatureFlagsProvider>
          <DashboardProvider>
            <Routes>
              {/* Public/landing */}
              <Route
                path="/"
                element={
                  <AppLayout>
                    {maybeProtect(<DashboardPage />)}
                  </AppLayout>
                }
              />

              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

              {/* Dashboards */}
              <Route
                path="/dashboard"
                element={
                  <AppLayout>
                    {maybeProtect(<DashboardPage />)}
                  </AppLayout>
                }
              />
              <Route
                path="/employee/dashboard"
                element={
                  <AppLayout>
                    {maybeProtect(<EmployeeDashboardPage />)}
                  </AppLayout>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <AppLayout>
                    {maybeAdmin(<AdminDashboardPage />)}
                  </AppLayout>
                }
              />

              {/* Learning Paths */}
              <Route
                path="/paths"
                element={
                  <AppLayout>
                    {maybeProtect(<PathsListPage />)}
                  </AppLayout>
                }
              />
              <Route
                path="/paths/:id"
                element={
                  <AppLayout>
                    {maybeProtect(<PathDetailPage />)}
                  </AppLayout>
                }
              />

              {/* Courses */}
              <Route
                path="/courses"
                element={
                  <AppLayout>
                    {maybeProtect(<CoursesPage />)}
                  </AppLayout>
                }
              />
              <Route
                path="/courses/:id"
                element={
                  <AppLayout>
                    {maybeProtect(<CourseDetailPage />)}
                  </AppLayout>
                }
              />
              <Route
                path="/lessons/:id"
                element={
                  <AppLayout>
                    {maybeProtect(<CoursePlayerPage />)}
                  </AppLayout>
                }
              />

              {/* Authoring (admin/instructor only when protected) */}
              <Route
                path="/authoring/paths"
                element={
                  <AppLayout>
                    {maybeAdmin(<PathsAuthoringPage />)}
                  </AppLayout>
                }
              />
              <Route
                path="/authoring/courses"
                element={
                  <AppLayout>
                    {maybeAdmin(<CoursesAuthoringPage />)}
                  </AppLayout>
                }
              />
              <Route
                path="/authoring/lessons"
                element={
                  <AppLayout>
                    {maybeAdmin(<LessonsAuthoringPage />)}
                  </AppLayout>
                }
              />

              {/* Other sections */}
              <Route
                path="/assignments"
                element={
                  <AppLayout>
                    {maybeProtect(<AssignmentsPage />)}
                  </AppLayout>
                }
              />
              <Route
                path="/grades"
                element={
                  <AppLayout>
                    {maybeProtect(<GradesPage />)}
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
