import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Box, ThemeProvider, CssBaseline } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import HomePage from "../pages/HomePage";
import Calculator from "../pages/Calculator";
import AboutPage from "../pages/AboutPage";
import PageTransition from "../components/animations/PageTransition";
import theme from "./theme";

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
          path="/calculator"
          element={
            <PageTransition>
              <Calculator />
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
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider theme={theme}>
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
      </ThemeProvider>
    </Router>
  );
};

export default App;
