import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useTheme,
} from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Calculator } from "lucide-react";

const Navbar = () => {
  const theme = useTheme();
  const location = useLocation();

  const isActiveRoute = (path) => {
    return location.pathname === path;
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
      <Container maxWidth="xl">
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
          <Box sx={{ display: "flex", gap: 1 }}>
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

            <Button
              variant="contained"
              component="a"
              href="https://github.com/tylerc122/GradeFlow"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                ml: 2,
                px: 2,
                borderRadius: 1,
              }}
            >
              View on GitHub
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
