import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Box, ThemeProvider, CssBaseline } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import HomePage from "../pages/HomePage";
import Calculator from "../pages/Calculator";
import AboutPage from "../pages/AboutPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import MyGradesPage from "../pages/MyGradesPage";
import PageTransition from "../components/animations/PageTransition";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import theme from "./theme";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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
            <PageTransition>
              <LoginPage />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <RegisterPage />
            </PageTransition>
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
          path="/about"
          element={
            <PageTransition>
              <AboutPage />
            </PageTransition>
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
      <ThemeProvider theme={theme}>
        <AuthProvider>
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
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
