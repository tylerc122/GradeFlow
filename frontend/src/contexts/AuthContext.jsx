import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Helper function to get the user's timezone
  const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  // Check authentication status when component mounts
  useEffect(() => {
    checkAuth();
  }, []);

  // Check for timezone updates in URL params after OAuth login
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const timezone_updated = queryParams.get("timezone_updated");
    
    // If we're logged in and have a timezone parameter, check if it matches browser timezone
    if (user && timezone_updated) {
      const browserTimezone = getUserTimezone();
      
      // If the timezone from the server doesn't match the browser, update it
      if (browserTimezone && timezone_updated !== browserTimezone) {
        updateUserTimezone(browserTimezone);
      }
      
      // Clean up the URL by removing the query parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Check if we need to update the timezone
        if (userData.timezone !== getUserTimezone()) {
          updateUserTimezone(getUserTimezone());
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserTimezone = async (timezone) => {
    try {
      const response = await fetch(`${API_URL}/api/users/timezone`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timezone }),
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        setUser(prev => ({ ...prev, timezone: result.timezone }));
        console.log(`Timezone updated to: ${result.timezone}`);
      }
    } catch (error) {
      console.error("Failed to update timezone:", error);
    }
  };

  const login = async (email, password) => {
    // Get user timezone
    const timezone = getUserTimezone();
    
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, timezone }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Login failed");
    }

    const userData = await response.json();
    setUser(userData);
    return userData;
  };

  const googleLogin = () => {
    // Get user timezone
    const timezone = getUserTimezone();
    
    // Add timezone as a query parameter to Google login URL
    window.location.href = `${API_URL}/api/auth/google/login?timezone=${encodeURIComponent(timezone)}`;
  };

  const register = async (name, email, password) => {
    // Get user timezone
    const timezone = getUserTimezone();
    
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, timezone }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Registration failed");
    }

    const userData = await response.json();
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Clear all user-related data from localStorage
      localStorage.removeItem('gpaCalculatorData');
      localStorage.removeItem('calculatorState');
      localStorage.removeItem('categories');
      localStorage.removeItem('grades');
      localStorage.removeItem('gradeCategories');
      
      // Clear all user-related data from sessionStorage
      sessionStorage.removeItem('isResultsView');
      sessionStorage.removeItem('lastViewedCalculation');
      sessionStorage.removeItem('calculatorState');
      sessionStorage.removeItem('calculatorData');
      sessionStorage.removeItem('categories');
      sessionStorage.removeItem('hasSeenResults');
      
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        googleLogin,
        logout,
        register,
        isAuthenticated: !!user,
        updateUserTimezone,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
