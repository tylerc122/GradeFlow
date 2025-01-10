import React from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  useTheme,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import CalculateIcon from "@mui/icons-material/Calculate";
import SchoolIcon from "@mui/icons-material/School";
import Percent from "@mui/icons-material/Percent";
import SocialProof from "../components/home-sections/SocialProof";
import FAQ from "../components/home-sections/FAQ";
import Footer from "../components/home-sections/Footer";

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Percent sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Set Your Structure",
      description:
        "Start by defining your course's grade categories and their weights. This one-time setup ensures accurate grade calculations.",
    },
    {
      icon: <ContentPasteIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Paste & Go",
      description:
        "Simply copy your grades from Blackboard and paste them in. No manual calculations needed.",
    },
    {
      icon: <AutoGraphIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Smart Categories",
      description:
        "Our AI-powered system automatically categorizes your assignments based on their names and types.",
    },
    {
      icon: <CalculateIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Instant Results",
      description:
        "Get your overall grade, category breakdowns, and performance metrics instantly.",
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        position: "absolute",
        width: "100%",
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "background.paper",
          pt: 12,
          pb: 8,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Calculate Your Grades
                <br />
                In Seconds
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                Stop wrestling with spreadsheets and manual calculations.
                GradeFlow automatically processes your Blackboard grades and
                calculates everything for you.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/calculator")}
                startIcon={<CalculateIcon />}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  fontSize: "1.1rem",
                }}
              >
                Start Calculating
              </Button>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  position: "relative",
                  "&:before": {
                    content: '""',
                    position: "absolute",
                    top: "10%",
                    left: "10%",
                    right: "-10%",
                    bottom: "-10%",
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}15, ${theme.palette.primary.light}15)`,
                    borderRadius: 5,
                    transform: "rotate(-3deg)",
                    zIndex: 0,
                  },
                }}
              >
                <Box
                  component="img"
                  src="./grade.png"
                  alt="Grade calculation illustration"
                  sx={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 4,
                    boxShadow: 3,
                    position: "relative",
                    zIndex: 1,
                    transform: "rotate(3deg) translateY(-20px)",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": {
                      transform: "rotate(0deg) translateY(-30px)",
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="xl" sx={{ py: 12 }}>
        {" "}
        <Typography variant="h3" align="center" sx={{ mb: 8, fontWeight: 600 }}>
          How It Works
        </Typography>
        <Grid
          container
          spacing={4}
          sx={{
            justifyContent: "center",
          }}
        >
          {features.map((feature, index) => (
            <Grid item sx={{ width: 350 }} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Social Proof Section i.e more cap cause it looks cool as hell its getting gutted for now */}
      {/*<SocialProof />*/}

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: "background.paper",
          pt: 6,
          pb: 5,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={2}
            sx={{
              p: 5,
              borderRadius: 4,
              textAlign: "center",
              background: `linear-gradient(45deg, ${theme.palette.background.paper} 30%, ${theme.palette.grey[50]} 90%)`,
              mb: 2,
            }}
          >
            <SchoolIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
              Ready to Calculate Your Grades?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Join thousands of students who have simplified their grade
              calculations with GradeFlow.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/calculator")}
              sx={{
                py: 1.5,
                px: 6,
                borderRadius: 2,
                fontSize: "1.1rem",
              }}
            >
              Get Started
            </Button>
          </Paper>
        </Container>
      </Box>
      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default HomePage;
