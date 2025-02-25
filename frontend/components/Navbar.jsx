import React, { useState, useEffect } from "react";
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
  useScrollTrigger,
  Avatar,
  Tooltip,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  alpha,
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Calculator,
  LogOut,
  User,
  Menu as MenuIcon,
  Home,
  Info,
  BarChart,
} from "lucide-react";
import { useAuth } from "../src/contexts/AuthContext";
import { useCalculator } from "../src/contexts/CalculatorContext";

// Create an elevated app bar effect on scroll
function ElevationScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 3 : 0,
    sx: {
      ...children.props.sx,
      backdropFilter: trigger ? "blur(12px)" : "blur(8px)",
      backgroundColor: trigger
        ? "rgba(255, 255, 255, 0.95)"
        : "rgba(255, 255, 255, 0.9)",
    },
  });
}

const Navbar = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isResultsView } = useCalculator();
  const [anchorEl, setAnchorEl] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const handleDashboard = async () => {
    handleMenuClose();
    navigate("/dashboard");
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Navigation items definition
  const navItems = [
    { text: "Home", path: "/", icon: <Home size={18} /> },
    { text: "Calculator", path: "/calculator", icon: <Calculator size={18} /> },
    ...(user
      ? [{ text: "My Grades", path: "/grades", icon: <BarChart size={18} /> }]
      : []),
    { text: "About", path: "/about", icon: <Info size={18} /> },
  ];

  // Drawer content for mobile
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center", py: 2 }}>
      <Box
        component={RouterLink}
        to="/"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          mb: 2,
        }}
      >
        <Calculator size={24} color={theme.palette.primary.main} />
        <Typography
          variant="h6"
          sx={{
            ml: 1,
            fontWeight: 700,
            color: theme.palette.primary.main,
          }}
        >
          GradeFlow
        </Typography>
      </Box>
      <Divider sx={{ mx: 2, mb: 2 }} />
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.text}
            component={RouterLink}
            to={item.path}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              mx: 1,
              mb: 1,
              backgroundColor: isActiveRoute(item.path)
                ? alpha(theme.palette.primary.main, 0.08)
                : "transparent",
              color: isActiveRoute(item.path)
                ? theme.palette.primary.main
                : theme.palette.text.primary,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: isActiveRoute(item.path) ? 600 : 500,
              }}
            />
          </ListItem>
        ))}
      </List>
      {user ? (
        <Box sx={{ mt: 2, px: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Signed in as
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {user.name || user.email}
            </Typography>
          </Box>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogOut size={16} />}
            onClick={handleLogout}
            sx={{ mt: 2 }}
          >
            Log Out
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            mt: 2,
            px: 2,
            display: "flex",
            gap: 1,
            flexDirection: "column",
          }}
        >
          <Button
            component={RouterLink}
            to="/login"
            variant="outlined"
            fullWidth
          >
            Login
          </Button>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            fullWidth
          >
            Sign Up
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <ElevationScroll>
        <AppBar
          position="sticky"
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            width: "100%",
          }}
        >
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Container
              maxWidth={false}
              sx={{
                width: isResultsView ? "2300px" : "100%",
                maxWidth: isResultsView ? "97vw" : "xl",
                transition: "all 0.3s ease-in-out",
              }}
            >
              <Toolbar
                disableGutters
                sx={{
                  display: "flex",
                  width: "100%",
                  minHeight: "70px", // Taller navbar
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
                    gap: 1.5,
                    "&:hover": {
                      "& .logo-icon": {
                        transform: "rotate(15deg)",
                      },
                    },
                  }}
                >
                  <Box
                    className="logo-icon"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      background: "var(--gradient-primary)",
                      transition: "transform 0.2s ease-in-out",
                    }}
                  >
                    <Calculator size={24} color="#ffffff" strokeWidth={2.5} />
                  </Box>
                  <Typography
                    variant="h5"
                    noWrap
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                      background: "var(--gradient-primary)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    GradeFlow
                  </Typography>
                </Box>

                {/* Mobile menu button */}
                {isMobile ? (
                  <IconButton
                    edge="end"
                    color="primary"
                    aria-label="menu"
                    onClick={handleDrawerToggle}
                    sx={{
                      ml: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                      },
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                ) : (
                  /* Desktop Navigation Links */
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {navItems.map((item) => (
                      <Button
                        key={item.text}
                        component={RouterLink}
                        to={item.path}
                        startIcon={item.icon}
                        sx={{
                          px: 2,
                          py: 1,
                          color: isActiveRoute(item.path)
                            ? "primary.main"
                            : "text.primary",
                          fontWeight: isActiveRoute(item.path) ? 600 : 500,
                          position: "relative",
                          overflow: "hidden",
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            backgroundColor: "primary.main",
                            borderTopLeftRadius: 3,
                            borderTopRightRadius: 3,
                            transform: isActiveRoute(item.path)
                              ? "scaleX(1)"
                              : "scaleX(0)",
                            transformOrigin: "center",
                            transition: "transform 0.3s ease",
                          },
                          "&:hover::after": {
                            transform: "scaleX(1)",
                          },
                        }}
                      >
                        {item.text}
                      </Button>
                    ))}

                    {/* Auth Buttons */}
                    {user ? (
                      <Tooltip title="Account">
                        <IconButton
                          onClick={handleMenuClick}
                          sx={{
                            ml: 2,
                            width: 42,
                            height: 42,
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: "var(--gradient-primary)",
                              opacity: 0.8,
                              borderRadius: "50%",
                            }}
                          />
                          <Typography
                            sx={{
                              color: "#ffffff",
                              fontWeight: 600,
                              fontSize: "1.1rem",
                              zIndex: 1,
                            }}
                          >
                            {user.name ? (
                              user.name.charAt(0).toUpperCase()
                            ) : (
                              <User size={20} />
                            )}
                          </Typography>
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Box sx={{ display: "flex", gap: 1, ml: 2 }}>
                        <Button
                          component={RouterLink}
                          to="/login"
                          variant="outlined"
                          sx={{ borderRadius: "12px", px: 2 }}
                        >
                          Login
                        </Button>
                        <Button
                          component={RouterLink}
                          to="/register"
                          variant="contained"
                          sx={{
                            borderRadius: "12px",
                            px: 2,
                            background: "var(--gradient-primary)",
                          }}
                        >
                          Sign Up
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              </Toolbar>
            </Container>
          </Box>
        </AppBar>
      </ElevationScroll>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 240,
            mt: 1.5,
            borderRadius: 3,
            overflow: "visible",
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 20,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem sx={{ p: 2 }} disabled>
          <Box>
            {user?.name && (
              <Typography variant="body1" fontWeight={600}>
                {user.name}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDashboard} sx={{ p: 2 }}>
          <ListItemIcon>
            <BarChart size={18} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </MenuItem>
        <MenuItem
          onClick={handleLogout}
          sx={{ p: 2, color: theme.palette.error.main }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <LogOut size={18} />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            borderRadius: "0 16px 16px 0",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
