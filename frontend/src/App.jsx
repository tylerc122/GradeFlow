import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import { SnackbarProvider } from "notistack";
import Navbar from "../components/Navbar";
import HomePage from "../pages/HomePage";
import Calculator from "../pages/Calculator";
import SavedCalculation from "../pages/SavedCalculation";
import AboutPage from "../pages/AboutPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import MyGradesPage from "../pages/MyGradesPage";
import Dashboard from "../pages/Dashboard";
import GPACalculatorPage from "../pages/GPACalculatorPage";
import PageTransition from "../components/animations/PageTransition";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CalculatorProvider } from "./contexts/CalculatorContext";
import { GPAProvider } from "./contexts/GPAContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const RedirectIfAuthenticated = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  // If user is logged in and tries to access login or register, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Separate component for animated routes
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <HomePage />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <PageTransition>
                <LoginPage />
              </PageTransition>
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuthenticated>
              <PageTransition>
                <RegisterPage />
              </PageTransition>
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/calculator"
          element={
            <PageTransition>
              <Calculator />
            </PageTransition>
          }
        />
        <Route
          path="/gpa-calculator"
          element={
            <PageTransition>
              <GPACalculatorPage />
            </PageTransition>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <AboutPage />
            </PageTransition>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/grades"
          element={
            <ProtectedRoute>
              <PageTransition>
                <MyGradesPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/grades/:id"
          element={
            <ProtectedRoute>
              <PageTransition>
                <SavedCalculation />
              </PageTransition>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

// Main App component
const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <UserPreferencesProvider>
            <CalculatorProvider>
              <GPAProvider>
                <SnackbarProvider maxSnack={3}>
                  <CssBaseline />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      minHeight: "100vh",
                      width: "100vw",
                      overflow: "hidden",
                    }}
                  >
                    <Navbar />
                    <Box
                      component="main"
                      sx={{
                        flexGrow: 1,
                        minHeight: "100%",
                        width: "100%",
                        overflow: "auto",
                      }}
                    >
                      <AnimatedRoutes />
                    </Box>
                  </Box>
                </SnackbarProvider>
              </GPAProvider>
            </CalculatorProvider>
          </UserPreferencesProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
