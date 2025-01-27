import React from "react";
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  useTheme,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        pt: 4,
        pb: 3,
        bgcolor: "background.default",
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: -2, // Pull footer up slightly to reduce gap
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              GradeFlow
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Making grade calculations simple, easy, and efficient.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Link
              href="/login"
              color="text.secondary"
              display="block"
              sx={{ mb: 1 }}
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              color="text.secondary"
              display="block"
              sx={{ mb: 1 }}
            >
              Dashboard
            </Link>
            <Link
              href="/about"
              color="text.secondary"
              display="block"
              sx={{ mb: 1 }}
            >
              About Us
            </Link>
            <Link
              href="/calculator"
              color="text.secondary"
              display="block"
              sx={{ mb: 1 }}
            >
              Grade Calculator
            </Link>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Connect
            </Typography>
            <Link
              href="https://github.com/yourusername/gradeflow"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
            >
              <GitHubIcon /> GitHub Repository
            </Link>
          </Grid>
        </Grid>
        <Box
          sx={{
            mt: 4,
            pt: 3,
            textAlign: "center",
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} GradeFlow. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
