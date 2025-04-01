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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCalculator } from "../src/contexts/CalculatorContext";

const MyGradesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { 
    lastViewedCalculation, 
    clearLastViewedCalculation, 
    setLastViewedCalculation,
    showGradesList,
    setShowGradesList
  } = useCalculator();
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [calculationToDelete, setCalculationToDelete] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [redirectChecked, setRedirectChecked] = useState(false);
  const [readyToRender, setReadyToRender] = useState(false);

  useEffect(() => {
    const fetchCalculations = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/grades/saved", {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch calculations");
        }

        const data = await response.json();
        setCalculations(data);
        
        if (lastViewedCalculation && data.length > 0 && !showGradesList) {
          const calculationExists = data.some(calc => calc.id.toString() === lastViewedCalculation.toString());
          
          if (calculationExists) {
            navigate(`/grades/${lastViewedCalculation}`);
            return;
          } else {
            clearLastViewedCalculation();
            setReadyToRender(true);
          }
          setRedirectChecked(true);
        } else {
          setReadyToRender(true);
        }
      } catch (err) {
        setError(err.message);
        setReadyToRender(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCalculations();
  }, [navigate, refreshTrigger, lastViewedCalculation, clearLastViewedCalculation, showGradesList]);

  useEffect(() => {
    const handleFocus = () => {
      setRefreshTrigger((prev) => prev + 1);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    const handleCalculationUpdate = (event) => {
      console.log("Received calculation update:", event.detail);
      setCalculations((prevCalculations) =>
        prevCalculations.map((calc) => {
          if (calc.id === event.detail.id) {
            console.log(
              `Updating calculation ${calc.id} grade to ${event.detail.newGrade}`
            );
            return {
              ...calc,
              results: {
                ...calc.results,
                overall_grade: event.detail.newGrade,
              },
            };
          }
          return calc;
        })
      );
    };

    window.addEventListener("calculationUpdated", handleCalculationUpdate);
    return () => {
      window.removeEventListener("calculationUpdated", handleCalculationUpdate);
    };
  }, []);

  const handleDelete = async (calculationId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/grades/${calculationId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete calculation");
      }

      setCalculations(calculations.filter((calc) => calc.id !== calculationId));
      
      // If the user deletes the calculation they were last viewing, clear it from session storage
      if (lastViewedCalculation && lastViewedCalculation.toString() === calculationId.toString()) {
        clearLastViewedCalculation();
      }
      
      enqueueSnackbar("Calculation deleted successfully", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar("Failed to delete calculation", { variant: "error" });
    }
    setDeleteDialogOpen(false);
    setCalculationToDelete(null);
  };

  const openDeleteDialog = (calculation) => {
    setCalculationToDelete(calculation);
    setDeleteDialogOpen(true);
  };

  // Function to navigate to a specific calculation
  const navigateToCalculation = (calculationId) => {
    // Set the last viewed calculation before navigating
    setCalculationToDelete(null);
    setLastViewedCalculation(calculationId);
    navigate(`/grades/${calculationId}`);
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

  if (!readyToRender) {
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
                <Box
                  onClick={() => navigateToCalculation(calc.id)}
                  sx={{ flexGrow: 1 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <AssignmentIcon
                      sx={{
                        fontSize: 40,
                        color: getGradeColor(calc.results.overall_grade),
                        opacity: 0.8,
                      }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        {calc.name}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 600,
                          color: getGradeColor(calc.results.overall_grade),
                        }}
                      >
                        {calc.results.overall_grade.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
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
                          {cat.name}: {cat.weight}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteDialog(calc);
                  }}
                  sx={{
                    color: "error.main",
                    "&:hover": {
                      backgroundColor: alpha("#f44336", 0.08),
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Calculation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{calculationToDelete?.name}"? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleDelete(calculationToDelete?.id)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

const getGradeColor = (grade) => {
  if (grade >= 90) return "#4caf50";
  if (grade >= 80) return "#2196f3";
  if (grade >= 70) return "#ff9800";
  return "#f44336";
};

export default MyGradesPage;
