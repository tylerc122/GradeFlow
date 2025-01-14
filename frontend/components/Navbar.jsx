import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Calculator, LogOut, User } from "lucide-react";
import { useAuth } from "../src/contexts/AuthContext";
import { useCalculator } from "../src/contexts/CalculatorContext";

const Navbar = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isResultsView } = useCalculator();
  const [anchorEl, setAnchorEl] = useState(null);

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate("/");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: `1px solid ${theme.palette.divider}`,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            width: isResultsView ? "2200px" : "100%",
            maxWidth: isResultsView ? "95vw" : "xl",
            transition: "all 0.3s ease-in-out",
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              display: "flex",
              width: "100%",
              minHeight: "64px",
              justifyContent: "space-between",
            }}
          >
            {/* Logo and Brand */}
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
                gap: 1,
              }}
            >
              <Calculator size={24} />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  color: "primary.main",
                }}
              >
                GradeFlow
              </Typography>
            </Box>

            {/* Navigation Links */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                component={RouterLink}
                to="/"
                sx={{
                  color: isActiveRoute("/") ? "primary.main" : "text.primary",
                  fontWeight: isActiveRoute("/") ? 600 : 500,
                }}
              >
                Home
              </Button>
              <Button
                component={RouterLink}
                to="/calculator"
                sx={{
                  color: isActiveRoute("/calculator")
                    ? "primary.main"
                    : "text.primary",
                  fontWeight: isActiveRoute("/calculator") ? 600 : 500,
                }}
              >
                Calculator
              </Button>

              {/* Only show My Grades if user is logged in */}
              {user && (
                <Button
                  component={RouterLink}
                  to="/grades"
                  sx={{
                    color: isActiveRoute("/grades")
                      ? "primary.main"
                      : "text.primary",
                    fontWeight: isActiveRoute("/grades") ? 600 : 500,
                  }}
                >
                  My Grades
                </Button>
              )}

              <Button
                component={RouterLink}
                to="/about"
                sx={{
                  color: isActiveRoute("/about")
                    ? "primary.main"
                    : "text.primary",
                  fontWeight: isActiveRoute("/about") ? 600 : 500,
                }}
              >
                About
              </Button>

              {/* Auth Buttons */}
              {user ? (
                <>
                  <IconButton
                    onClick={handleMenuClick}
                    sx={{
                      ml: 2,
                      width: 40,
                      height: 40,
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    }}
                  >
                    {/* Show first letter of name if available */}
                    {user.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <User size={20} />
                    )}
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      sx: { width: 200, mt: 1 },
                    }}
                  >
                    <MenuItem disabled>
                      <Box>
                        {user.name && (
                          <Typography variant="body1">{user.name}</Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <LogOut size={18} style={{ marginRight: 8 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: "flex", gap: 1, ml: 2 }}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    sx={{ borderRadius: 2 }}
                  >
                    Sign Up
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </Box>
    </AppBar>
  );
};

export default Navbar;
