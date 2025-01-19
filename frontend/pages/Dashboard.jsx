import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  useTheme,
  Button,
} from "@mui/material";
import {
  Timeline,
  TrendingUp,
  School,
  Assignment,
  Refresh,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // State for different data sections
  const [stats, setStats] = useState(null);
  const [recentCalculations, setRecentCalculations] = useState([]);
  const [trends, setTrends] = useState(null);

  // Loading and error states
  const [loading, setLoading] = useState({
    stats: true,
    recent: true,
    trends: true,
  });
  const [error, setError] = useState(null);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading({ stats: true, recent: true, trends: true });
    setError(null);

    try {
      // Fetch stats
      const statsResponse = await fetch(
        "http://localhost:8000/api/grades/dashboard/stats",
        {
          credentials: "include",
        }
      );
      if (!statsResponse.ok) throw new Error("Failed to fetch statistics");
      const statsData = await statsResponse.json();
      setStats(statsData);
      setLoading((prev) => ({ ...prev, stats: false }));

      // Fetch recent calculations
      const recentResponse = await fetch(
        "http://localhost:8000/api/grades/dashboard/recent",
        {
          credentials: "include",
        }
      );
      if (!recentResponse.ok)
        throw new Error("Failed to fetch recent calculations");
      const recentData = await recentResponse.json();
      setRecentCalculations(recentData);
      setLoading((prev) => ({ ...prev, recent: false }));

      // Fetch trends
      const trendsResponse = await fetch(
        "http://localhost:8000/api/grades/dashboard/trends",
        {
          credentials: "include",
        }
      );
      if (!trendsResponse.ok) throw new Error("Failed to fetch trends");
      const trendsData = await trendsResponse.json();
      setTrends(trendsData);
      setLoading((prev) => ({ ...prev, trends: false }));
    } catch (err) {
      setError(err.message);
      setLoading({ stats: false, recent: false, trends: false });
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getGradeColor = (grade) => {
    if (!grade && grade !== 0) return theme.palette.text.secondary;
    if (grade >= 90) return theme.palette.success.main;
    if (grade >= 80) return theme.palette.primary.main;
    if (grade >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Dashboard
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={fetchDashboardData}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <School sx={{ color: "primary.main", mr: 1 }} />
                <Typography variant="h6">Latest Grade</Typography>
              </Box>
              {loading.stats ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 600,
                      color: getGradeColor(stats?.latest_grade),
                    }}
                  >
                    {stats?.latest_grade?.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    From your most recent calculation
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUp sx={{ color: "primary.main", mr: 1 }} />
                <Typography variant="h6">Average Grade</Typography>
              </Box>
              {loading.stats ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 600,
                      color: getGradeColor(stats?.average_grade),
                    }}
                  >
                    {stats?.average_grade?.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall average across all calculations
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Assignment sx={{ color: "primary.main", mr: 1 }} />
                <Typography variant="h6">Total Assignments</Typography>
              </Box>
              {loading.stats ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>
                    {stats?.total_assignments || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Across all calculations
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Grade History Chart */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Grade History
            </Typography>
            {loading.trends ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends?.overall_trend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString()
                      }
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      labelFormatter={(date) => new Date(date).toLocaleString()}
                      formatter={(value) => [`${value.toFixed(1)}%`, "Grade"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="grade"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Calculations */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Calculations
            </Typography>
            {loading.recent ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {recentCalculations.map((calc) => (
                  <Grid item xs={12} md={4} key={calc.id}>
                    <Card
                      sx={{
                        cursor: "pointer",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: theme.shadows[4],
                        },
                      }}
                      onClick={() => navigate(`/grades/${calc.id}`)}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Typography variant="h6">{calc.name}</Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              color: getGradeColor(calc.results?.overall_grade),
                            }}
                          >
                            {calc.results?.overall_grade?.toFixed(1)}%
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {new Date(calc.created_at).toLocaleDateString()}
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {calc.categories.map((cat) => (
                            <Box
                              key={cat.name}
                              sx={{
                                bgcolor: "action.hover",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.875rem",
                              }}
                            >
                              {cat.name}
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
