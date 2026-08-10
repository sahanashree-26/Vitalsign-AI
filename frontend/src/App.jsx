import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";

import Login from "./pages/Login";
import Home from "./pages/Home";
import HealthAssessment from "./pages/HealthAssessment";
import UploadReport from "./pages/UploadReport";
import MyAssessments from "./pages/MyAssessments";
import About from "./pages/About";
import Profile from "./pages/Profile";


function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


function AppRoutes() {
  return (
    <Routes>

      {/* Login */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Home */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* Health Assessment */}
      <Route
        path="/health-assessment"
        element={
          <ProtectedRoute>
            <HealthAssessment />
          </ProtectedRoute>
        }
      />

      {/* Upload Report */}
      <Route
        path="/upload-report"
        element={
          <ProtectedRoute>
            <UploadReport />
          </ProtectedRoute>
        }
      />

      {/* My Assessments */}
      <Route
        path="/my-assessments"
        element={
          <ProtectedRoute>
            <MyAssessments />
          </ProtectedRoute>
        }
      />

      {/* Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* About */}
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        }
      />

      {/* Default */}
      <Route
        path="/"
        element={<Navigate to="/home" replace />}
      />

      {/* Unknown URL */}
      <Route
        path="*"
        element={<Navigate to="/home" replace />}
      />

    </Routes>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}