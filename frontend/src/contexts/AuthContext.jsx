import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Check authentication status when component mounts
  useEffect(() => {
    // Check if current URL is the Google OAuth callback
    const url = window.location.href;
    if (url.includes('/api/auth/google/callback') || url.includes('?code=')) {
      handleGoogleCallback();
      return;
    }
    
    checkAuth();
  }, []);

  const handleGoogleCallback = async () => {
    try {
      setLoading(true);
      // Get the code from the URL
      const code = new URLSearchParams(window.location.search).get('code');
      
      if (!code) {
        console.error("No authorization code found in URL");
        setLoading(false);
        navigate('/login');
        return;
      }
      
      // Determine if we're in a development or production environment
      const isProduction = window.location.hostname !== 'localhost';
      
      // Extract the auth code and make a request to the backend
      let endpoint;
      if (isProduction) {
        // For production, send directly to the backend endpoint
        endpoint = `https://gradeflow.org/api/auth/google/callback?code=${code}`;
      } else {
        // For local development
        endpoint = `${API_URL}/api/auth/google/callback?code=${code}`;
      }
      
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Google authentication failed');
      }
      
      const userData = await response.json();
      setUser(userData);
      navigate('/calculator'); // Redirect to calculator after successful login
    } catch (error) {
      console.error("Google callback error:", error);
      navigate('/login'); // Redirect to login on error
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
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
    // Redirect to the Google OAuth login endpoint
    window.location.href = `${API_URL}/api/auth/google/login`;
  };

  const register = async (name, email, password) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
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

      setUser(null);
      navigate("/login");
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
