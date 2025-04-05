import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  alpha,
  Divider,
} from "@mui/material";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import { useAuth } from "../src/contexts/AuthContext";
import { useTheme } from "@mui/material/styles";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin } = useAuth(); // Get login and googleLogin functions from AuthContext
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  // Check for error parameter in URL (for Google login errors)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const errorParam = queryParams.get("error");
    
    if (errorParam === "google_auth_failed") {
      setError("Google authentication failed. Please try again or use email login.");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password); // Use AuthContext's login function
      navigate("/calculator");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    googleLogin();
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={2}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: alpha("#2196f3", 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <LockOutlinedIcon sx={{ color: "primary.main" }} />
        </Box>

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Welcome Back
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, width: "100%" }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "100%",
            "& .MuiTextField-root": {
              "& .MuiInputBase-input": {
                color: "text.primary",
                "&:-webkit-autofill": {
                  WebkitBoxShadow: theme.palette.mode === "dark" ? "0 0 0 100px #252525 inset !important" : "0 0 0 100px #ffffff inset !important",
                  WebkitTextFillColor: theme.palette.mode === "dark" ? "#e0e0e0 !important" : "#2c3e50 !important",
                  caretColor: theme.palette.mode === "dark" ? "#e0e0e0" : "#2c3e50",
                },
              },
            },
          }}
        >
          {/* Google Sign In Button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{
              py: 1.5,
              mb: 3,
              fontSize: "1rem",
              borderColor: "#ddd",
              color: "text.primary",
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: alpha("#2196f3", 0.05),
              },
            }}
          >
            Sign in with Google
          </Button>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: 2,
              bgcolor: "background.paper",
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 3,
              bgcolor: "background.paper",
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              mb: 2,
              fontSize: "1.1rem",
            }}
          >
            {loading ? "Signing in..." : "Sign In with Email"}
          </Button>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link component={RouterLink} to="/register">
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
