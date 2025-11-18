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
import { applyCssVariables } from "./theme";
import "./App.css";

// PUBLIC_INTERFACE
function App() {
  /** Main app entry: sets theme variables and declares routes. */
  useEffect(() => {
    applyCssVariables();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
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
            path="/courses"
            element={
              <PrivateRoute>
                <AppLayout>
                  <CoursesPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <PrivateRoute>
                <AppLayout>
                  <CourseDetailPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
