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
import ProtectedRoute from "./components/ProtectedRoute";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import AccountPage from "./pages/AccountPage";

/**
 * Main app with Supabase-auth routes.
 * - Public: /, /signin, /signup, /health
 * - Protected: /dashboard, /paths, /courses, /assignments, /grades, authoring and admin dashboards
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
              {/* Public landing shows dashboard/paths teaser */}
              <Route
                path="/"
                element={
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                }
              />

              {/* Auth routes */}
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

              {/* Protected app pages */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DashboardPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EmployeeDashboardPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AppLayout>
                      <AdminDashboardPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Learning Paths */}
              <Route
                path="/paths"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PathsListPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/paths/:id"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PathCourses />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Courses */}
              <Route
                path="/courses"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CoursesPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              {/* Player route for course content */}
              <Route
                path="/courses/:id"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CourseModules />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Authoring */}
              <Route
                path="/authoring/paths"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AppLayout>
                      <PathsAuthoringPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/authoring/courses"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AppLayout>
                      <CoursesAuthoringPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Account */}
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <AccountPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Other sections */}
              <Route
                path="/assignments"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <AssignmentsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/grades"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <GradesPage />
                    </AppLayout>
                  </ProtectedRoute>
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
