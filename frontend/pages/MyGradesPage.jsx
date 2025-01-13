import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  alpha,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AssignmentIcon from "@mui/icons-material/Assignment";

const MyGradesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCalculations = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/grades/saved", {
          credentials: "include", // Important for cookies/session
        });

        if (!response.ok) {
          // If not authenticated, redirect to login
          if (response.status === 401) {
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch calculations");
        }

        const data = await response.json();
        setCalculations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCalculations();
  }, [navigate]);

  const getGradeColor = (grade) => {
    if (grade >= 90) return theme.palette.success.main;
    if (grade >= 80) return theme.palette.primary.main;
    if (grade >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <Container
        sx={{
          py: 8,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        My Saved Calculations
      </Typography>

      <Grid container spacing={3}>
        {calculations.map((calc) => (
          <Grid item xs={12} key={calc.id}>
            <Paper
              elevation={2}
              onClick={() => navigate(`/calculator/results/${calc.id}`)}
              sx={{
                p: 3,
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[4],
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <AssignmentIcon
                  sx={{
                    fontSize: 40,
                    color: getGradeColor(calc.results.overall_grade),
                    opacity: 0.8,
                  }}
                />

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                    {calc.name}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        color: getGradeColor(calc.results.overall_grade),
                      }}
                    >
                      {calc.results.overall_grade.toFixed(1)}%
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 2 }}
                    >
                      Saved on {formatDate(calc.created_at)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    {calc.categories.map((cat) => (
                      <Box
                        key={cat.name}
                        sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          border: "1px solid",
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                        }}
                      >
                        <Typography variant="body2">
                          {cat.name}: Weight {cat.weight}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}

        {calculations.length === 0 && (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              }}
            >
              <Typography color="text.secondary">
                You haven't saved any grade calculations yet.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default MyGradesPage;
