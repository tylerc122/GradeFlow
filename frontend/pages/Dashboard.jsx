/**
 * The dashboard page, where the user can see their stats. GPA, latest grade, etc.
 */
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
  alpha,
  Chip,
  Skeleton,
  LinearProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from "@mui/material";
import {
  BarChart,
  TrendingUp,
  School,
  Calendar,
  RefreshCcw,
  ChevronRight,
  Star,
  Award,
  CheckCircle,
  AlertCircle,
  Calculator,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import GPADashboardCard from "../components/GPADashboardCard";
import { useCalculator } from "../src/contexts/CalculatorContext";
import { useSnackbar } from "notistack";
import { useAuth } from "../src/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { setLastViewedCalculation } = useCalculator();
  const { user, setUser } = useAuth();

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
  const [refreshing, setRefreshing] = useState(false);

  // State for delete account dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const CONFIRMATION_PHRASE = "DELETE MY ACCOUNT";

  // Handle unauthorized or forbidden responses
  const handleAuthError = (response) => {
    if (response.status === 401 || response.status === 403) {
      enqueueSnackbar("Please login to view your dashboard", { variant: "error" });
      navigate("/login");
      return true;
    }
    return false;
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ feedback: deleteFeedback }),
      });

      if (response.status === 401 || response.status === 403) {
        enqueueSnackbar("Session expired. Please log in again.", { variant: "error" });
        setUser(null);
        localStorage.removeItem('gpaCalculatorData');
        localStorage.removeItem('calculatorState');
        localStorage.removeItem('categories');
        localStorage.removeItem('grades');
        localStorage.removeItem('gradeCategories');
        sessionStorage.removeItem('isResultsView');
        sessionStorage.removeItem('lastViewedCalculation');
        sessionStorage.removeItem('calculatorState');
        sessionStorage.removeItem('calculatorData');
        sessionStorage.removeItem('categories');
        sessionStorage.removeItem('hasSeenResults');
        window.location.href = '/';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete account");
      }

      enqueueSnackbar("Account deleted successfully", { variant: "success" });
      setOpenDeleteDialog(false);
      
      // Clear user state directly
      if (setUser) {
          setUser(null);
      }
      
      // Clear storage
      localStorage.removeItem('gpaCalculatorData');
      localStorage.removeItem('calculatorState');
      localStorage.removeItem('categories');
      localStorage.removeItem('grades');
      localStorage.removeItem('gradeCategories');
    
      sessionStorage.removeItem('isResultsView');
      sessionStorage.removeItem('lastViewedCalculation');
      sessionStorage.removeItem('calculatorState');
      sessionStorage.removeItem('calculatorData');
      sessionStorage.removeItem('categories');
      sessionStorage.removeItem('hasSeenResults');

      // Redirect to home page with reload
      window.location.href = '/';

    } catch (err) {
      enqueueSnackbar(err.message, { variant: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    // Don't attempt to fetch if not logged in
    if (!user) {
      navigate("/login");
      return;
    }

    setRefreshing(true);
    setLoading({
      stats: !stats,
      recent: !recentCalculations.length,
      trends: !trends,
    });
    setError(null);

    try {
      // Fetch stats
      const statsResponse = await fetch(
        `${API_URL}/api/grades/dashboard/stats`,
        {
          credentials: "include",
        }
      );
      
      if (handleAuthError(statsResponse)) return;
      
      if (!statsResponse.ok) throw new Error("Failed to fetch statistics");
      const statsData = await statsResponse.json();
      setStats(statsData);
      setLoading((prev) => ({ ...prev, stats: false }));

      // Fetch recent calculations
      const recentResponse = await fetch(
        `${API_URL}/api/grades/dashboard/recent`,
        {
          credentials: "include",
        }
      );
      
      if (handleAuthError(recentResponse)) return;
      
      if (!recentResponse.ok)
        throw new Error("Failed to fetch recent calculations");
      const recentData = await recentResponse.json();
      setRecentCalculations(recentData);
      setLoading((prev) => ({ ...prev, recent: false }));

      // Fetch trends
      const trendsResponse = await fetch(
        `${API_URL}/api/grades/dashboard/trends`,
        {
          credentials: "include",
        }
      );
      
      if (handleAuthError(trendsResponse)) return;
      
      if (!trendsResponse.ok) throw new Error("Failed to fetch trends");
      const trendsData = await trendsResponse.json();
      setTrends(trendsData);
      setLoading((prev) => ({ ...prev, trends: false }));
    } catch (err) {
      setError(err.message);
      setLoading({ stats: false, recent: false, trends: false });
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 600);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const getGradeColor = (grade) => {
    if (!grade && grade !== 0) return theme.palette.text.secondary;
    if (grade >= 90) return theme.palette.success.main;
    if (grade >= 80) return theme.palette.primary.main;
    if (grade >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getGradeStatus = (grade) => {
    if (!grade && grade !== 0) return null;
    if (grade >= 90)
      return {
        icon: <CheckCircle size={14} />,
        text: "Excellent",
        color: theme.palette.success.main,
      };
    if (grade >= 80)
      return {
        icon: <Star size={14} />,
        text: "Good",
        color: theme.palette.primary.main,
      };
    if (grade >= 70)
      return {
        icon: <Award size={14} />,
        text: "Satisfactory",
        color: theme.palette.warning.main,
      };
    return {
      icon: <AlertCircle size={14} />,
      text: "Needs improvement",
      color: theme.palette.error.main,
    };
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  // Enhanced stats cards
  const renderStatCard = (
    title,
    value,
    icon,
    color,
    subtitle = null,
    isLoading = false
  ) => (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        borderRadius: "20px",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: `0 12px 20px ${alpha(color, 0.15)}`,
        },
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Decorative accent */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "4px",
          background: `linear-gradient(90deg, ${color} 0%, ${alpha(
            color,
            0.4
          )} 100%)`,
        }}
      />

      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "12px",
              bgcolor: alpha(color, 0.1),
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>

        {isLoading ? (
          <Skeleton
            variant="rectangular"
            width="80%"
            height={42}
            sx={{ borderRadius: 1, mb: 1 }}
          />
        ) : (
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: color,
              mb: 1,
            }}
          >
            {typeof value === "number" ? value.toFixed(1) + "%" : value || "-"}
          </Typography>
        )}

        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}

        {/* Add status chip for grade values */}
        {typeof value === "number" && getGradeStatus(value) && (
          <Chip
            icon={getGradeStatus(value).icon}
            label={getGradeStatus(value).text}
            size="small"
            sx={{
              mt: 2,
              fontWeight: 500,
              bgcolor: alpha(getGradeStatus(value).color, 0.1),
              color: getGradeStatus(value).color,
              border: `1px solid ${alpha(getGradeStatus(value).color, 0.2)}`,
            }}
          />
        )}
      </CardContent>
    </Card>
  );

  // Create a navigation helper
  const navigateToCalculation = (calculationId) => {
    setLastViewedCalculation(calculationId);
    navigate(`/grades/${calculationId}`);
  };

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: "16px",
            boxShadow: theme.shadows[2],
          }}
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
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 5,
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
          Dashboard
        </Typography>
        <Button
          startIcon={
            refreshing ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <RefreshCcw />
            )
          }
          onClick={fetchDashboardData}
          variant="outlined"
          disabled={refreshing}
          sx={{
            borderRadius: "12px",
            px: 3,
            py: 1,
            fontSize: "0.95rem",
          }}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          {renderStatCard(
            "Latest Grade",
            stats?.latest_grade,
            <School strokeWidth={1.5} size={24} />,
            theme.palette.primary.main,
            "From your most recent calculation",
            loading.stats
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {renderStatCard(
            "Average Grade",
            stats?.average_grade,
            <TrendingUp strokeWidth={1.5} size={24} />,
            theme.palette.secondary.main,
            "Overall average across all calculations",
            loading.stats
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <GPADashboardCard />
        </Grid>

        {/* Grade History Chart */}
        <Grid item xs={12}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: "20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "30%",
                height: "100%",
                background: `linear-gradient(90deg, ${alpha(
                  theme.palette.primary.main,
                  0
                )} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
                zIndex: 0,
              }}
            />

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <BarChart
                  strokeWidth={1.5}
                  size={24}
                  color={theme.palette.primary.main}
                />
                <Typography variant="h5" fontWeight={600}>
                  Grade History
                </Typography>
              </Box>

              {loading.trends ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    py: 4,
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    height={300}
                    sx={{ borderRadius: 2 }}
                  />
                </Box>
              ) : (
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends?.overall_trend || []}>
                      <defs>
                        <linearGradient
                          id="gradeColorGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={theme.palette.primary.main}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="100%"
                            stopColor={theme.palette.primary.main}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={alpha(theme.palette.divider, 0.6)}
                      />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) =>
                          new Date(date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
                        }
                        stroke={theme.palette.text.secondary}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke={theme.palette.text.secondary}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <RechartsTooltip
                        labelFormatter={(date) =>
                          new Date(date).toLocaleString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        }
                        formatter={(value) => [`${value.toFixed(1)}%`, "Grade"]}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: "8px",
                          border: `1px solid ${theme.palette.divider}`,
                          boxShadow: theme.shadows[3],
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                      <Area
                        type="monotone"
                        dataKey="grade"
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#gradeColorGradient)"
                        activeDot={{
                          r: 6,
                          strokeWidth: 2,
                          stroke: theme.palette.primary.main,
                          fill: theme.palette.background.paper,
                        }}
                        name="Grade Percentage"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Calculations */}
        <Grid item xs={12}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: "20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "30%",
                height: "100%",
                background: `linear-gradient(270deg, ${alpha(
                  theme.palette.secondary.main,
                  0
                )} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
                zIndex: 0,
              }}
            />

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 4,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CheckCircle
                    strokeWidth={1.5}
                    size={24}
                    color={theme.palette.secondary.main}
                  />
                  <Typography variant="h5" fontWeight={600}>
                    Recent Calculations
                  </Typography>
                </Box>
                <Button
                  endIcon={<ChevronRight size={18} />}
                  size="small"
                  onClick={() => navigate("/grades")}
                  sx={{ borderRadius: "8px" }}
                >
                  View All
                </Button>
              </Box>

              {loading.recent ? (
                <Grid container spacing={3}>
                  {[1, 2, 3].map((i) => (
                    <Grid item xs={12} md={4} key={i}>
                      <Skeleton
                        variant="rectangular"
                        height={180}
                        sx={{ borderRadius: 3 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container spacing={3}>
                  {recentCalculations.length > 0 ? (
                    recentCalculations.map((calc) => (
                      <Grid item xs={12} md={4} key={calc.id}>
                        <Card
                          sx={{
                            position: "relative",
                            cursor: "pointer",
                            transition: "all 0.2s ease-in-out",
                            borderRadius: "16px",
                            overflow: "hidden",
                            "&:hover": {
                              transform: "translateY(-6px)",
                              boxShadow: theme.shadows[4],
                              "& .view-details": {
                                opacity: 1,
                              },
                            },
                            height: "100%",
                            border: "1px solid",
                            borderColor: alpha(
                              getGradeColor(calc.results?.overall_grade),
                              0.2
                            ),
                          }}
                          onClick={() => navigateToCalculation(calc.id)}
                        >
                          {/* Progress indicator at top */}
                          <LinearProgress
                            variant="determinate"
                            value={calc.results?.overall_grade || 0}
                            sx={{
                              height: "6px",
                              borderRadius: 0,
                              "& .MuiLinearProgress-bar": {
                                background: getGradeColor(
                                  calc.results?.overall_grade
                                ),
                              },
                            }}
                          />

                          <CardContent sx={{ p: 3 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 2,
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  mb: 0.5,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: "200px",
                                }}
                              >
                                {calc.name}
                              </Typography>
                              <Chip
                                label={`${calc.results?.overall_grade?.toFixed(
                                  1
                                )}%`}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  backgroundColor: alpha(
                                    getGradeColor(calc.results?.overall_grade),
                                    0.1
                                  ),
                                  color: getGradeColor(
                                    calc.results?.overall_grade
                                  ),
                                  border: `1px solid ${alpha(
                                    getGradeColor(calc.results?.overall_grade),
                                    0.3
                                  )}`,
                                }}
                              />
                            </Box>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 2 }}
                            >
                              {formatDate(calc.created_at)}
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            <Box
                              sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                            >
                              {calc.categories.slice(0, 3).map((cat) => (
                                <Chip
                                  key={cat.name}
                                  label={cat.name}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(
                                      theme.palette.primary.light,
                                      0.1
                                    ),
                                    fontSize: "0.75rem",
                                    height: "24px",
                                  }}
                                />
                              ))}
                              {calc.categories.length > 3 && (
                                <Chip
                                  label={`+${calc.categories.length - 3}`}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(
                                      theme.palette.primary.light,
                                      0.05
                                    ),
                                    fontSize: "0.75rem",
                                    height: "24px",
                                  }}
                                />
                              )}
                            </Box>

                            <Button
                              variant="outlined"
                              className="view-details"
                              size="small"
                              endIcon={<ChevronRight size={16} />}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent double navigation from parent onClick
                                navigateToCalculation(calc.id);
                              }}
                              sx={{
                                mt: 2,
                                width: "100%",
                                opacity: { xs: 1, md: 0 },
                                transition: "opacity 0.2s ease-in-out",
                                borderColor: alpha(
                                  getGradeColor(calc.results?.overall_grade),
                                  0.4
                                ),
                                color: getGradeColor(
                                  calc.results?.overall_grade
                                ),
                                "&:hover": {
                                  borderColor: getGradeColor(
                                    calc.results?.overall_grade
                                  ),
                                  backgroundColor: alpha(
                                    getGradeColor(calc.results?.overall_grade),
                                    0.05
                                  ),
                                },
                              }}
                            >
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 4,
                          textAlign: "center",
                          bgcolor: alpha(theme.palette.primary.main, 0.03),
                          borderRadius: "16px",
                          border: `1px dashed ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                        }}
                      >
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                          You haven't saved any grade calculations yet.
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => navigate("/calculator")}
                          startIcon={<Calculator size={18} />}
                          sx={{
                            borderRadius: "10px",
                            background: "var(--gradient-primary)",
                          }}
                        >
                          Start Calculating
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Account Section */}
      <Paper
        elevation={1}
        sx={{ mt: 4, p: 3, borderRadius: "20px", bgcolor: alpha(theme.palette.error.main, 0.05) }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: theme.palette.error.dark }}>
          Danger Zone
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Deleting your account is permanent and cannot be undone. All your saved calculations and data will be lost.
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={() => setOpenDeleteDialog(true)}
          sx={{ borderRadius: '12px' }}
        >
          Delete My Account
        </Button>
      </Paper>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you absolutely sure you want to delete your account?
            This action is irreversible and will remove all your data, including saved calculations.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="feedback"
            label="Reason for leaving (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={deleteFeedback}
            onChange={(e) => setDeleteFeedback(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            To confirm, please type "<strong>{CONFIRMATION_PHRASE}</strong>" in the box below.
          </Typography>
          <TextField
            required
            margin="dense"
            id="delete-confirm"
            label={`Type "${CONFIRMATION_PHRASE}" to confirm`}
            type="text"
            fullWidth
            variant="outlined"
            value={deleteConfirmationInput}
            onChange={(e) => setDeleteConfirmationInput(e.target.value)}
            error={deleteConfirmationInput.length > 0 && deleteConfirmationInput !== CONFIRMATION_PHRASE}
            helperText={deleteConfirmationInput.length > 0 && deleteConfirmationInput !== CONFIRMATION_PHRASE ? "Confirmation text does not match." : ""}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setOpenDeleteDialog(false);
              setDeleteConfirmationInput("");
              setDeleteFeedback("");
            }}
            color="inherit" 
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            variant="contained"
            color="error"
            disabled={isDeleting || deleteConfirmationInput !== CONFIRMATION_PHRASE}
            sx={{ borderRadius: '8px' }}
          >
            {isDeleting ? <CircularProgress size={20} color="inherit" /> : "Permanently Delete Account"}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default Dashboard;
