import React, { useState } from "react";
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
import { useNavigate, Link as RouterLink } from "react-router-dom";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import { useAuth } from "../src/contexts/AuthContext";
import { useTheme } from "@mui/material/styles";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      navigate("/calculator");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGoogleSignup = () => {
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
            bgcolor: alpha("#4caf50", 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <PersonAddOutlinedIcon sx={{ color: "primary.main" }} />
        </Box>

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Create an Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, width: "100%" }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: "100%" }}
        >
          {/* Google Sign Up Button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignup}
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
            Sign up with Google
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
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            sx={{ mb: 3 }}
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
            {loading ? "Creating account..." : "Sign Up with Email"}
          </Button>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link component={RouterLink} to="/login">
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
