import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useTheme as useMuiTheme,
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
  Moon,
  Sun,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../src/contexts/AuthContext";
import { useCalculator } from "../src/contexts/CalculatorContext";
import { useTheme } from "../src/contexts/ThemeContext";


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
  const muiTheme = useMuiTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isResultsView, clearLastViewedCalculation } = useCalculator();
  const { mode, toggleTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Check if we're on a saved calculation page
  const isSavedCalculation = location.pathname.startsWith('/grades/') && location.pathname.split('/').length > 2;
  
  // Define isCalculatorRelated before using it
  // Only return to normal width when navigating to a non-results page that isn't calculator or grades
  const isCalculatorRelated = location.pathname === '/calculator' || 
                             location.pathname === '/grades' || 
                             location.pathname.startsWith('/grades/');
  
  // Track expanded state persistently
  const [keepNavExpanded, setKeepNavExpanded] = useState(() => {
    return localStorage.getItem('keepNavExpanded') === 'true';
  });
  
  // Prevent immediate collapsing by tracking the last expanded state
  const [prevLocationPathname, setPrevLocationPathname] = useState(location.pathname);
  
  // If navigating from calculator to grades or vice versa, maintain expansion
  // Make sure we exclude GPA calculator from this rule
  const isTransitioningBetweenRelatedPages = 
    (prevLocationPathname === '/calculator' && location.pathname.startsWith('/grades/')) || 
    (prevLocationPathname.startsWith('/grades/') && location.pathname === '/calculator');
  
  // Update previous location
  useEffect(() => {
    setPrevLocationPathname(location.pathname);
  }, [location.pathname]);
  
  // Set expanded state when on results or saved calculation
  useEffect(() => {
    if (isResultsView || isSavedCalculation) {
      localStorage.setItem('keepNavExpanded', 'true');
      setKeepNavExpanded(true);
    }
  }, [isResultsView, isSavedCalculation]);
  
  // Reset expanded view for non-results pages and explicitly for GPA calculator
  useEffect(() => {
    if (!isCalculatorRelated && !location.pathname.includes('calculator') && !location.pathname.includes('grades')) {
      localStorage.removeItem('keepNavExpanded');
      setKeepNavExpanded(false);
    }
    
    // Explicitly reset for GPA calculator page
    if (location.pathname === '/gpa-calculator') {
      localStorage.removeItem('keepNavExpanded');
      setKeepNavExpanded(false);
    }
  }, [location.pathname, isCalculatorRelated]);

  // Determine if we should use expanded view - exclude GPA calculator
  const useExpandedView = 
    (keepNavExpanded || isResultsView || isSavedCalculation || isTransitioningBetweenRelatedPages) && 
    location.pathname !== '/gpa-calculator';
  
  // Store isResultsView in session storage when it changes
  useEffect(() => {
    if (isResultsView) {
      sessionStorage.setItem('isResultsView', 'true');
    } else if (!location.pathname.includes('calculator') && !location.pathname.includes('grades')) {
      sessionStorage.removeItem('isResultsView');
    }
  }, [isResultsView, location.pathname]);

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
    // Clear the last viewed calculation when logging out
    clearLastViewedCalculation();
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

  // Use effect to override backdrop filter based on theme
  useEffect(() => {
    if (document.querySelector(".MuiAppBar-root")) {
      document.querySelector(".MuiAppBar-root").style.backgroundColor =
        mode === "dark" ? "rgba(18, 18, 18, 0.9)" : "rgba(255, 255, 255, 0.9)";
    }
  }, [mode]);

  // Navigation items definition
  const navItems = [
    { text: "Home", path: "/", icon: <Home size={18} /> },
    { text: "Calculator", path: "/calculator", icon: <Calculator size={18} /> },
    { text: "GPA Calculator", path: "/gpa-calculator", icon: <GraduationCap size={18} /> },
    ...(user
      ? [{ text: "My Grades", path: "/grades", icon: <BarChart size={18} /> }]
      : []),
    { text: "About", path: "/about", icon: <Info size={18} /> },
  ];

  // Function to handle navigation with clearing last viewed calculation for non-calculator pages
  const handleNavigation = (path) => {
    // Only clear the last viewed calculation when explicitly logging out or resetting
    // Don't clear when navigating between regular pages
    navigate(path);
  };

  // Drawer content for mobile
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center", py: 2 }}>
      <Box
        onClick={() => handleNavigation('/')}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          mb: 2,
          cursor: "pointer",
        }}
      >
        <Calculator size={24} color={muiTheme.palette.primary.main} />
        <Typography
          variant="h6"
          sx={{
            ml: 1,
            fontWeight: 700,
            color: muiTheme.palette.primary.main,
          }}
        >
          GradeFlow
        </Typography>
      </Box>
      <Divider sx={{ mx: 2, mb: 2 }} />

      {/* Theme Toggle in Drawer */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <IconButton
          onClick={toggleTheme}
          sx={{
            color: muiTheme.palette.primary.main,
            bgcolor: alpha(muiTheme.palette.primary.main, 0.1),
            "&:hover": {
              bgcolor: alpha(muiTheme.palette.primary.main, 0.2),
            },
            '&:focus, &:focus-visible': { outline: 'none' },
          }}
        >
          {mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </IconButton>
      </Box>

      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              mx: 1,
              mb: 1,
              cursor: "pointer",
              backgroundColor: isActiveRoute(item.path)
                ? alpha(muiTheme.palette.primary.main, 0.08)
                : "transparent",
              color: isActiveRoute(item.path)
                ? muiTheme.palette.primary.main
                : muiTheme.palette.text.primary,
              "&:hover": {
                backgroundColor: alpha(muiTheme.palette.primary.main, 0.08),
              },
              '&:focus, &:focus-visible': { outline: 'none' },
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
            sx={{ mt: 2, '&:focus, &:focus-visible': { outline: 'none' } }}
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
            onClick={() => handleNavigation('/login')}
            variant="outlined"
            fullWidth
            sx={{ '&:focus, &:focus-visible': { outline: 'none' } }}
          >
            Login
          </Button>
          <Button
            onClick={() => handleNavigation('/register')}
            variant="contained"
            fullWidth
            sx={{ '&:focus, &:focus-visible': { outline: 'none' } }}
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
            borderBottom: `1px solid ${muiTheme.palette.divider}`,
            width: "100%",
          }}
        >
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Container
              maxWidth={false}
              sx={{
                width: useExpandedView ? "2300px" : "100%",
                maxWidth: useExpandedView ? "97vw" : "xl",
                transition: "all 0.3s ease-in-out",
              }}
            >
              <Toolbar
                disableGutters
                sx={{
                  display: "flex",
                  width: "100%",
                  minHeight: "70px",
                  justifyContent: "space-between",
                }}
              >
                {/* Logo and Brand */}
                <Box
                  component={RouterLink}
                  to="/"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation('/');
                  }}
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
                      color: muiTheme.palette.primary.main,
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {/* Theme Toggle Button (Mobile) */}
                    <IconButton
                      color="primary"
                      onClick={toggleTheme}
                      sx={{
                        bgcolor: alpha(muiTheme.palette.primary.main, 0.08),
                        "&:hover": {
                          bgcolor: alpha(muiTheme.palette.primary.main, 0.12),
                        },
                        '&:focus, &:focus-visible': { outline: 'none' },
                      }}
                    >
                      {mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                    </IconButton>

                    <IconButton
                      edge="end"
                      color="primary"
                      aria-label="menu"
                      onClick={handleDrawerToggle}
                      sx={{
                        bgcolor: alpha(muiTheme.palette.primary.main, 0.08),
                        "&:hover": {
                          bgcolor: alpha(muiTheme.palette.primary.main, 0.12),
                        },
                        '&:focus, &:focus-visible': { outline: 'none' },
                      }}
                    >
                      <MenuIcon />
                    </IconButton>
                  </Box>
                ) : (
                  /* Desktop Navigation Links */
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {navItems.map((item) => (
                      <Button
                        key={item.text}
                        onClick={() => handleNavigation(item.path)}
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
                            pointerEvents: "none",
                          },
                          "&:hover::after": {
                            transform: "scaleX(1)",
                          },
                          '&:focus, &:focus-visible': { outline: 'none' },
                        }}
                      >
                        {item.text}
                      </Button>
                    ))}

                    {/* Theme Toggle Button (Desktop) */}
                    <Tooltip
                      title={
                        mode === "dark"
                          ? "Switch to Light Mode"
                          : "Switch to Dark Mode"
                      }
                    >
                      <IconButton
                        onClick={toggleTheme}
                        sx={{
                          mx: 1,
                          bgcolor: alpha(muiTheme.palette.primary.main, 0.08),
                          color: muiTheme.palette.primary.main,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            bgcolor: alpha(muiTheme.palette.primary.main, 0.12),
                          },
                          '&:focus, &:focus-visible': { outline: 'none' },
                        }}
                      >
                        {mode === "dark" ? (
                          <Sun size={20} />
                        ) : (
                          <Moon size={20} />
                        )}
                      </IconButton>
                    </Tooltip>

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
                            '&:focus, &:focus-visible': { outline: 'none' },
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
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "100%",
                              height: "100%",
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
                          onClick={() => handleNavigation('/login')}
                          variant="outlined"
                          sx={{ borderRadius: "12px", px: 2, '&:focus, &:focus-visible': { outline: 'none' } }}
                        >
                          Login
                        </Button>
                        <Button
                          onClick={() => handleNavigation('/register')}
                          variant="contained"
                          sx={{
                            borderRadius: "12px",
                            px: 2,
                            background: "var(--gradient-primary)",
                            '&:focus, &:focus-visible': { outline: 'none' },
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
          sx={{ p: 2, color: muiTheme.palette.error.main }}
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
