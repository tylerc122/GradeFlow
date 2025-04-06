import React from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
  Paper,
  alpha,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  ChevronRight,
  Copy,
  BarChart3,
  Sparkles,
  School,
  Layers,
  Sigma,
  Users,
  Zap,
  Upload,
  Gauge,
  Clock,
} from "lucide-react";
import FAQ from "../components/home-sections/FAQ";
import Footer from "../components/home-sections/Footer";
import { useTheme as useCustomTheme } from "../src/contexts/ThemeContext";

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, isDark } = useCustomTheme();

  // Updated features with modern icons and enhanced descriptions
  const features = [
    {
      icon: <Layers strokeWidth={1.5} size={38} />,
      title: "Smart Categories",
      description:
        "Our AI automatically sorts your assignments into the right categories so you don't have to manually categorize everything.",
      color: theme.palette.primary.main,
    },
    {
      icon: <Upload strokeWidth={1.5} size={38} />,
      title: "Just Copy & Paste",
      description:
        "Copy your grades directly from Blackboard and paste them in. No tedious data entry or complicated imports.",
      color: theme.palette.secondary.main,
    },
    {
      icon: <Gauge strokeWidth={1.5} size={38} />,
      title: "Instant Results",
      description:
        "Get your overall grade, category breakdowns, and visual performance metrics calculated in seconds.",
      color: theme.palette.success.main,
    },
    {
      icon: <Clock strokeWidth={1.5} size={38} />,
      title: "What-If Analysis",
      description:
        "See how future assignments might affect your final grade with our powerful what-if scenario builder.",
      color: theme.palette.warning.main,
    },
  ];

  const stats = []

  // // Stats for the social proof section
  // const stats = [
  //   {
  //     value: "50+",
  //     label: "Universities",
  //     icon: <School strokeWidth={1.5} />,
  //   },
  //   {
  //     value: "99%",
  //     label: "Accuracy",
  //     icon: <Sigma strokeWidth={1.5} />,
  //   },
  //   {
  //     value: "10K+",
  //     label: "Students",
  //     icon: <Users strokeWidth={1.5} />,
  //   },
  // ];

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        position: "relative",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Background decoration elements */}
      <Box
        sx={{
          position: "absolute",
          top: "5%",
          right: "5%",
          width: "300px",
          height: "300px",
          background: alpha(theme.palette.primary.main, 0.03),
          borderRadius: "50%",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          width: "250px",
          height: "250px",
          background: alpha(theme.palette.secondary.main, 0.03),
          borderRadius: "50%",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />

      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 10, md: 16 },
          pb: { xs: 8, md: 12 },
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        <Container maxWidth="xl">
          <Grid
            container
            spacing={{ xs: 6, md: 8 }}
            alignItems="center"
            justifyContent="space-between"
          >
            <Grid item xs={12} md={6} lg={5}>
              <Stack spacing={4}>
                <Box>
                  <Chip
                    label="Student-focused grade calculator"
                    size="small"
                    icon={<Sparkles size={14} />}
                    sx={{
                      mb: 3,
                      fontWeight: 500,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      borderRadius: "8px",
                      "& .MuiChip-icon": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      mb: 2,
                      fontSize: { xs: "2.25rem", md: "3rem", lg: "3.5rem" },
                      background: "var(--gradient-primary)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      WebkitTextFillColor: "transparent",
                      lineHeight: 1.2,
                    }}
                  >
                    Calculate Your Grades In Seconds
                  </Typography>
                  <Typography
                    variant="h5"
                    color="text.secondary"
                    sx={{
                      mb: 4,
                      fontWeight: 400,
                      fontSize: { xs: "1.1rem", md: "1.25rem" },
                      lineHeight: 1.5,
                    }}
                  >
                    Stop wrestling with spreadsheets. GradeFlow automatically
                    processes your Blackboard grades and calculates everything
                    for you.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: { xs: "wrap", sm: "nowrap" },
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/calculator")}
                    endIcon={<ChevronRight />}
                    sx={{
                      py: 1.5,
                      px: { xs: 3, sm: 4 },
                      borderRadius: "14px",
                      fontSize: "1.1rem",
                      flexGrow: { xs: 1, sm: 0 },
                      background: "var(--gradient-primary)",
                      boxShadow:
                        "0 10px 20px " + alpha(theme.palette.primary.main, 0.2),
                    }}
                  >
                    Start Calculating
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/about")}
                    sx={{
                      py: 1.5,
                      px: { xs: 3, sm: 4 },
                      borderRadius: "14px",
                      fontSize: "1.1rem",
                      borderWidth: "2px",
                      flexGrow: { xs: 1, sm: 0 },
                    }}
                  >
                    Learn More
                  </Button>
                </Box>

                {/* Quick stats */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 4,
                    mt: 2,
                    flexWrap: "wrap",
                  }}
                >
                  {stats.map((stat, i) => (
                    <Box
                      key={i}
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 36,
                          height: 36,
                          borderRadius: "8px",
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                          color: theme.palette.primary.main,
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{ lineHeight: 1.2 }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6} lg={6}>
              <Box
                sx={{
                  position: "relative",
                  "& img": {
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "24px",
                    boxShadow:
                      "0 20px 40px " + alpha(theme.palette.common.black, 0.1),
                    transform:
                      "perspective(1000px) rotateY(-5deg) rotateX(5deg)",
                    transition: "all 0.5s ease-in-out",
                    "&:hover": {
                      transform:
                        "perspective(1000px) rotateY(0deg) rotateX(0deg)",
                      boxShadow:
                        "0 25px 50px " + alpha(theme.palette.common.black, 0.15),
                    },
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: "15%",
                    right: "-5%",
                    bottom: "-5%",
                    left: "15%",
                    background: "var(--gradient-primary)",
                    borderRadius: "24px",
                    filter: "blur(30px)",
                    opacity: 0.15,
                    zIndex: -1,
                  },
                }}
              >
                {mode === "dark" ? (
                  <img
                  src="./dark.png"
                  alt="Grade calculation illustration"
                  style={{
                    maxWidth: "100%",
                    border: `1px solid ${alpha(
                      theme.palette.common.black,
                      0.1
                    )}`,
                  }}
                />
                ) : (
                  <img
                    src="./grade.png"
                    alt="Grade calculation illustration"
                    style={{
                      maxWidth: "100%",
                      border: `1px solid ${alpha(
                        theme.palette.common.black,
                        0.1
                      )}`,
                    }}
                  />
                )}

                {/* Floating icons */}
                {[
                  { icon: <Calculator />, top: "10%", left: "-5%", delay: 0 },
                  {
                    icon: <BarChart3 />,
                    bottom: "15%",
                    right: "-5%",
                    delay: 0.2,
                  },
                  { icon: <Copy />, top: "40%", right: "-8%", delay: 0.4 },
                ].map((item, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      top: item.top,
                      left: item.left,
                      bottom: item.bottom,
                      right: item.right,
                      backgroundColor: isDark
                        ? alpha(theme.palette.background.paper, 0.8)
                        : "white",
                      width: 60,
                      height: 60,
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 10px 25px ${alpha(
                        theme.palette.common.black,
                        isDark ? 0.3 : 0.1
                      )}`,
                      color: theme.palette.primary.main,
                      animation: `float 3s ease-in-out infinite ${item.delay}s`,
                      zIndex: 2,
                      border: `1px solid ${alpha(
                        theme.palette.common.white,
                        isDark ? 0.1 : 0.05
                      )}`,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {item.icon}
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, position: "relative", zIndex: 1 }}>
        <Container maxWidth="xl">
          <Typography
            variant="h3"
            align="center"
            sx={{
              mb: { xs: 6, md: 8 },
              fontWeight: 700,
              background: "var(--gradient-primary)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
              mx: "auto",
            }}
          >
            How GradeFlow Works
          </Typography>

          <Grid
            container
            spacing={4}
            sx={{
              justifyContent: "center",
            }}
          >
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease",
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: alpha(feature.color, 0.2),
                    "&:hover": {
                      boxShadow: `0 12px 30px ${alpha(feature.color, 0.15)}`,
                      "& .feature-icon-wrapper": {
                        transform: "scale(1.1)",
                        backgroundColor: alpha(feature.color, 0.15),
                      },
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 4,
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      className="feature-icon-wrapper"
                      sx={{
                        mb: 3,
                        width: 70,
                        height: 70,
                        borderRadius: "16px",
                        backgroundColor: alpha(feature.color, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: feature.color,
                        transition: "all 0.3s ease",
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        color: feature.color,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: "background.paper",
          py: { xs: 6, md: 8 },
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
        }}
      >

      <Box
        sx={{
          position: "absolute",
          bottom: "0%",
          left: "-5%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: alpha(theme.palette.secondary.main, 0.03),
          filter: "blur(50px)",
          zIndex: 0,
        }}
      />
        <Container maxWidth="md">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: "24px",
              background: "var(--gradient-primary)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative elements */}
            <Box
              sx={{
                position: "absolute",
                top: "20%",
                right: "0%",
                width: "200px",
                height: "200px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
                filter: "blur(60px)",
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: "-10%",
                left: "5%",
                width: "150px",
                height: "150px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "50%",
                filter: "blur(40px)",
                zIndex: 0,
              }}
            />

            <Box sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <Zap
                color="white"
                size={56}
                strokeWidth={1.5}
                style={{ marginBottom: "16px" }}
              />
              <Typography
                variant="h3"
                sx={{ mb: 2, fontWeight: 700, color: "white" }}
              >
                Ready to Calculate Your Grades?
              </Typography>
              <Typography
                variant="h6"
                sx={{ mb: 4, fontWeight: 400, color: "white", opacity: 0.9 }}
              >
                Join the students who have simplified their grade
                calculations with GradeFlow.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/calculator")}
                sx={{
                  py: 1.75,
                  px: 5,
                  borderRadius: "14px",
                  fontSize: "1.1rem",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  fontWeight: 700,
                  border: "1px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                    border: "1px solid rgba(255,255,255,0.3)",
                  },
                }}
              >
                Get Started Now
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Add animation keyframes */}
      <Box
        sx={{
          "@keyframes float": {
            "0%, 100%": {
              transform: "translateY(0px)",
            },
            "50%": {
              transform: "translateY(-10px)",
            },
          },
        }}
      />

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default HomePage;
