import React, { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, PrivateRoute } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/LoginPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
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
import { useAuth } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import PathsAuthoringPage from "./pages/authoring/PathsAuthoringPage";
import CoursesAuthoringPage from "./pages/authoring/CoursesAuthoringPage";

// Admin guard component
function AdminRoute({ children }) {
  /**
   * Admin-only route guard; shows unauthorized message or redirects.
   */
  const { user, initializing } = useAuth();
  if (initializing) return <div style={{ padding: 24 }}>Loading...</div>;
  if (user?.role !== "admin") {
    return (
      <div style={{ padding: 24 }}>
        <h2 className="page-title">Unauthorized</h2>
        <p className="page-subtitle">You do not have access to this page.</p>
      </div>
    );
  }
  return children;
}

/* PUBLIC_INTERFACE */
function AuthorRoute({ children }) {
  /**
   * Route guard for authoring tools.
   * Authorization: role must be "admin" or "instructor".
   * Returns an inline Unauthorized state if access is denied.
   */
  const { user, initializing } = useAuth();
  if (initializing) return <div style={{ padding: 24 }}>Loading...</div>;
  const allowed = user?.role === "admin" || user?.role === "instructor";
  if (!allowed) {
    return (
      <div style={{ padding: 24 }}>
        <h2 className="page-title">Unauthorized</h2>
        <p className="page-subtitle">Only instructors and admins can access authoring tools.</p>
      </div>
    );
  }
  return children;
}

// PUBLIC_INTERFACE
function App() {
  /** Main app entry: sets theme variables and declares routes. */
  useEffect(() => {
    applyCssVariables();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <DashboardProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/dashboard"
            element={
              <PrivateRoute>
                <AppLayout>
                  <EmployeeDashboardPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <AdminRoute>
                  <AppLayout>
                    <AdminDashboardPage />
                  </AppLayout>
                </AdminRoute>
              </PrivateRoute>
            }
          />

          {/* Learning Paths */}
          <Route
            path="/paths"
            element={
              <PrivateRoute>
                <AppLayout>
                  <PathsListPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/paths/:id"
            element={
              <PrivateRoute>
                <AppLayout>
                  <PathDetailPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          {/* Courses */}
          <Route
            path="/courses"
            element={
              <PrivateRoute>
                <AppLayout>
                  <CoursesPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          {/* Player route for course content (role-agnostic) */}
          <Route
            path="/courses/:id"
            element={
              <PrivateRoute>
                <AppLayout>
                  <CoursePlayerPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          {/* Authoring (instructor/admin) */}
          <Route
            path="/authoring/paths"
            element={
              <PrivateRoute>
                <AuthorRoute>
                  <AppLayout>
                    <PathsAuthoringPage />
                  </AppLayout>
                </AuthorRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/authoring/courses"
            element={
              <PrivateRoute>
                <AuthorRoute>
                  <AppLayout>
                    <CoursesAuthoringPage />
                  </AppLayout>
                </AuthorRoute>
              </PrivateRoute>
            }
          />

          {/* Other sections */}
          <Route
            path="/assignments"
            element={
              <PrivateRoute>
                <AppLayout>
                  <AssignmentsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/grades"
            element={
              <PrivateRoute>
                <AppLayout>
                  <GradesPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </DashboardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
