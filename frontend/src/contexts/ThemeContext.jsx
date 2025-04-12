/**
 * Controls context for theme i.e light/dark mode.
 */
import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import createAppTheme from "../theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check local storage for saved preference, default to 'light'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    return savedMode || "light";
  });

  // Apply theme change and save to local storage
  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  const setThemeMode = (newMode) => {
    if (newMode === "light" || newMode === "dark") {
      setMode(newMode);
      localStorage.setItem("themeMode", newMode);
    }
  };

  // Helper functions for components
  const isDark = mode === "dark";
  const isLight = mode === "light";

  // Utility function to get appropriate background based on theme
  const getBackgroundColor = (lightColor, darkColor) => {
    return mode === "light" ? lightColor : darkColor;
  };

  // Generate the MUI theme based on current mode
  const theme = createAppTheme(mode);

  // Add a class to the body for global CSS access
  useEffect(() => {
    document.body.classList.remove("light-mode", "dark-mode");
    document.body.classList.add(`${mode}-mode`);

    // Apply meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        mode === "light" ? "#ffffff" : "#121212"
      );
    }
  }, [mode]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        toggleTheme,
        setThemeMode,
        isDark,
        isLight,
        getBackgroundColor,
      }}
    >
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
