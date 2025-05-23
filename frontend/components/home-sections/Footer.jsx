/**
 * Footer of the home page.
 * Shows some social links, navigation links, etc.
 */
import React from "react";
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  useTheme,
  IconButton,
  Divider,
  Stack,
  Button,
  alpha,
} from "@mui/material";
import {
  Github,
  Linkedin,
  Mail,
  Calculator,
  ExternalLink,
  ChevronRight,
  Star,
  Home,
  Info,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../src/contexts/AuthContext"; 

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();

  // Navigation links
  const navLinks = [
    { title: "Home", path: "/", icon: <Home size={16} /> },
    {
      title: "Calculator",
      path: "/calculator",
      icon: <Calculator size={16} />,
    },
    { title: "About", path: "/about", icon: <Info size={16} /> },
  ];

  // Resource links - dynamically change based on auth status
  const resourceLinks = [
    ...(user
      ? [
          // Links for logged-in users
          {
            title: "Dashboard",
            path: "/dashboard",
            icon: <ChevronRight size={14} />,
          },
          {
            title: "My Grades",
            path: "/grades",
            icon: <ChevronRight size={14} />,
          },
        ]
      : [
          // Links for non-logged-in users
          { title: "Login", path: "/login", icon: <ChevronRight size={14} /> },
          {
            title: "Register",
            path: "/register",
            icon: <ChevronRight size={14} />,
          },
        ]),
  ];

  // Social links
  const socialLinks = [
    {
      icon: <Github size={20} color={theme.palette.text.secondary} />,
      url: "https://github.com/tylerc122",
      label: "GitHub",
    },
    {
      icon: <Linkedin size={20} color={theme.palette.text.secondary} />,
      url: "https://www.linkedin.com/in/tyler-collo-345679276/",
      label: "LinkedIn",
    },
    {
      icon: <Mail size={20} color={theme.palette.text.secondary} />,
      url: "mailto:tylercollo1@gmail.com",
      label: "Email",
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        pt: 8,
        pb: 4,
        bgcolor: "background.default",
        borderTop: `1px solid ${theme.palette.divider}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background gradient elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: "100%",
          background: `radial-gradient(circle at 100% 0%, ${alpha(
            theme.palette.primary.main,
            0.05
          )} 0%, transparent 60%)`,
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "40%",
          height: "70%",
          background: `radial-gradient(circle at 0% 100%, ${alpha(
            theme.palette.secondary.main,
            0.05
          )} 0%, transparent 60%)`,
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={6}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Calculator size={24} color="white" />
              </Box>
              <Typography variant="h5" color="primary.main" fontWeight={700}>
                GradeFlow
              </Typography>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: "80%" }}
            >
              Making grade calculations simple, easy, and efficient for students
              everywhere.
            </Typography>

            <div style={{ display: "flex", gap: "8px" }}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  sx={{
                    color: "text.secondary",
                    backgroundColor: "transparent",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.common.white, 0.08)
                          : alpha(theme.palette.common.black, 0.06),
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </div>
          </Grid>

          {/* Navigation Links */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography
              variant="h6"
              color="text.primary"
              gutterBottom
              fontWeight={600}
            >
              Navigation
            </Typography>
            <Stack spacing={1.5}>
              {navLinks.map((link, index) => (
                <Button
                  key={index}
                  component={RouterLink}
                  to={link.path}
                  startIcon={link.icon}
                  sx={{
                    justifyContent: "flex-start",
                    color: "text.secondary",
                    fontWeight: 500,
                    textTransform: "none",
                    transition: "all 0.2s ease-in-out",
                    borderRadius: "8px",
                    p: 1,
                    pl: 1.5,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  {link.title}
                </Button>
              ))}
            </Stack>

            <Box sx={{ mt: 3 }}>
              <Typography
                variant="h6"
                color="text.primary"
                gutterBottom
                fontWeight={600}
              >
                Resources
              </Typography>
              <Stack spacing={1.5}>
                {resourceLinks.map((link, index) => (
                  <Link
                    key={index}
                    component={RouterLink}
                    to={link.path}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "text.secondary",
                      textDecoration: "none",
                      fontWeight: 500,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        color: theme.palette.primary.main,
                        transform: "translateX(4px)",
                        "& svg": {
                          color: theme.palette.primary.main,
                        },
                      },
                    }}
                  >
                    {link.icon}
                    {link.title}
                  </Link>
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* Newsletter & Contact */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography
              variant="h6"
              color="text.primary"
              gutterBottom
              fontWeight={600}
            >
              Connect
            </Typography>

            <div
              style={{
                padding: '24px',
                borderRadius: '16px',
                backgroundColor: 'inherit',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(118, 129, 214, 0.3)' : 'rgba(118, 129, 214, 0.1)'}`,
                marginBottom: '24px',
                marginLeft: '-4px', 
                marginRight: '4px',
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Star size={18} color={theme.palette.primary.main} />
                <Typography
                  variant="subtitle1"
                  color="primary.main"
                  fontWeight={600}
                >
                  Like this project?
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Check out the GitHub repository and give it a star if you found
                it useful!
              </Typography>

              <Button
                variant="outlined"
                component="a"
                href="https://github.com/tylerc122/gradeflow"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<Github size={18} />}
                endIcon={<ExternalLink size={14} />}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  borderWidth: "2px",
                  width: { xs: '100%', sm: 'auto' },
                  ...(theme.palette.mode === 'dark' && {
                    backgroundColor: 'transparent',
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    color: theme.palette.primary.main
                  }),
                  "&:hover": {
                    borderWidth: "2px",
                    ...(theme.palette.mode === 'dark' && {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      borderColor: theme.palette.primary.main
                    })
                  },
                }}
              >
                View on GitHub
              </Button>
            </div>

            <Typography variant="body2" color="text.secondary">
              Have a question or feedback? Feel free to
              <Link
                href="mailto:tylercollo1@gmail.com"
                sx={{
                  ml: 0.5,
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                }}
              >
                reach out
              </Link>
              .
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.875rem" }}
          >
            © {currentYear} GradeFlow. All rights reserved.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 3,
              "& a": {
                color: "text.secondary",
                fontSize: "0.875rem",
                textDecoration: "none",
                transition: "color 0.2s ease-in-out",
                "&:hover": {
                  color: theme.palette.primary.main,
                },
              },
            }}
          >
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
