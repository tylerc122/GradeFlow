import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
  Box,
  Stack,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Grid,
} from "@mui/material";
import { RefreshCw, BarChart2 } from "lucide-react";
import { useAuth } from "../../src/contexts/AuthContext";
import { useCalculator } from "../../src/contexts/CalculatorContext";
import SaveCalculationDialog from "../dialogs/SaveCalculationDialog";
import { GradeSummary } from "./GradeSummary";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { AssignmentTable } from "./AssignmentTable";
import { HypotheticalAssignmentDialog } from "../dialogs/HypotheticalAssignmentDialog";
import ManualGradeTable from "./ManualGradeTable";
import { letterGradeToPoints, isLetterGrade } from "../../src/utils/letterGradeUtils";
import { cleanResetCalculator } from "../../reset-workaround";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Results = ({ 
  isSavedCalculation = false,
  showCalculateAnotherButton: propShowCalculateAnotherButton,
  mode: propMode
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Get state from context
  const {
    categories,
    setCategories,
    mode: contextMode,
    manualGrades,
    setManualGrades,
    parsedGrades,
    whatIfMode,
    setWhatIfMode,
    targetGrade,
    setTargetGrade,
    hypotheticalScores,
    setHypotheticalScores,
    hypotheticalAssignments,
    setHypotheticalAssignments,
    dialogOpen,
    setDialogOpen,
    selectedCategory,
    setSelectedCategory,
    hiddenAssignments,
    setHiddenAssignments,
    rawGradeData,
    resetCalculator,
    activeStep,
    setActiveStep,
    setIsResultsView,
    showCalculateAnotherButton: contextShowCalculateAnotherButton,
    clearLastViewedCalculation,
  } = useCalculator();

  // Set isResultsView when component mounts and clean up when unmounting
  useEffect(() => {
    setIsResultsView(true);
    
    // Cleanup function - run when component unmounts
    return () => {
      // Only clear isResultsView if this is not a saved calculation view
      if (!isSavedCalculation) {
        setIsResultsView(false);
        sessionStorage.removeItem('isResultsView');
      }
    };
  }, [setIsResultsView, isSavedCalculation,]);

  // Use prop if provided, otherwise use context value or default to true if not in SavedCalculation view
  const showCalculateAnotherButton = propShowCalculateAnotherButton !== undefined 
    ? propShowCalculateAnotherButton 
    : (contextShowCalculateAnotherButton !== undefined
        ? contextShowCalculateAnotherButton
        : !isSavedCalculation); // Default to true, except in saved calculation view
    
  // Use prop mode if provided, otherwise use context mode
  const mode = propMode !== undefined ? propMode : contextMode;

  // Local state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savingError, setSavingError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);

  const calculateCategoryGrade = (assignments, categoryName) => {
    if (!assignments || !assignments.length) return 0;

    const visibleAssignments = assignments.filter(
      (assignment) =>
        !hiddenAssignments.includes(`${categoryName}-${assignment.name}`)
    );

    if (!visibleAssignments.length) return 0;

    // console.log(`Calculating grade for ${categoryName}:`, visibleAssignments);

    const totalEarned = visibleAssignments.reduce((sum, a) => {
      const scoreKey = `${categoryName}-${a.name}`;
      const hypothetical = hypotheticalScores[scoreKey];
      
      // Use numericScore for calculations if available, otherwise fall back to score
      let scoreValue;
      if (hypothetical) {
        scoreValue = hypothetical.numericScore !== undefined && hypothetical.numericScore !== null
          ? hypothetical.numericScore
          : (typeof hypothetical.score === 'string' 
             ? Number(hypothetical.score) || 0 
             : hypothetical.score || 0);
        // console.log(`Using hypothetical score for ${a.name}: ${scoreValue}`);
      } else {
        scoreValue = typeof a.score === 'string' ? Number(a.score) || 0 : a.score || 0;
        // console.log(`Using original score for ${a.name}: ${scoreValue}`);
      }
      
      return sum + scoreValue;
    }, 0);

    const totalPossible = visibleAssignments.reduce(
      (sum, a) => sum + Number(a.total_points),
      0
    );

    const result = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
    // console.log(`Category ${categoryName}: Total earned ${totalEarned}, total possible ${totalPossible}, result ${result}%`);
    
    return result;
  };

  const calculateWeightedGrade = () => {
    if (mode === "manual") {
      let totalWeightedPoints = 0;
      let totalWeight = 0;
      let hasLetterGrades = false;

      categories.forEach((category) => {
        const grade = manualGrades.find(
          (g) => g.categoryName === category.name
        );
        if (grade) {
          if (grade.isLetter && isLetterGrade(grade.grade)) {
            hasLetterGrades = true;
            // Get GPA points directly
            const points = letterGradeToPoints(grade.grade);
            totalWeightedPoints += points * category.weight;
          } else {
            totalWeightedPoints += grade.value * category.weight;
          }
          totalWeight += category.weight;
        }
      });

      return {
        percentage: totalWeight > 0 ? totalWeightedPoints / totalWeight : 0,
        hasLetterGrades
      };
    }

    // For blackboard mode, return just the percentage
    const percentage = categories.reduce((total, category) => {
      const categoryHypotheticals = hypotheticalAssignments.filter(
        (a) => a.categoryName === category.name
      );

      const allAssignments = [
        ...(category.assignments || []),
        ...categoryHypotheticals,
      ];

      const categoryGrade = calculateCategoryGrade(
        allAssignments,
        category.name
      );
      return total + categoryGrade * (category.weight / 100);
    }, 0);
    
    return {
      percentage,
      hasLetterGrades: false
    };
  };

  const handleToggleAssignmentVisibility = (categoryName, assignmentName) => {
    const assignmentKey = `${categoryName}-${assignmentName}`;
    
    // Update hidden assignments list
    setHiddenAssignments(prev => 
      prev.includes(assignmentKey)
        ? prev.filter(key => key !== assignmentKey)
        : [...prev, assignmentKey]
    );
    
    // We don't need to modify hypotheticalScores here as hiddenAssignments state
    // is being properly tracked for changes in SavedCalculation.jsx
  };

  const handleDeleteAssignment = (categoryName, assignmentName) => {
    // Update categories by removing the assignment
    setCategories((prev) =>
      prev.map((category) => {
        if (category.name === categoryName) {
          return {
            ...category,
            assignments: category.assignments.filter(
              (a) => a.name !== assignmentName
            ),
          };
        }
        return category;
      })
    );

    // Remove from hypothetical assignments if present
    setHypotheticalAssignments((prev) =>
      prev.filter(
        (a) => !(a.categoryName === categoryName && a.name === assignmentName)
      )
    );

    // Remove from hidden assignments if present
    const assignmentKey = `${categoryName}-${assignmentName}`;
    setHiddenAssignments(prev => 
      prev.filter(key => key !== assignmentKey)
    );

    // Remove from hypothetical scores if present
    // We do this to clean up, but also to ensure the fact that we deleted an assignment
    // gets tracked as a change in whatIfMode
    setHypotheticalScores(prev => {
      const newScores = { ...prev };
      delete newScores[assignmentKey];
      
      // If we're in what-if mode, add a special flag to track deletions
      if (whatIfMode) {
        newScores[`deleted-${assignmentKey}`] = {
          deleted: true,
          categoryName,
          name: assignmentName
        };
      }
      
      return newScores;
    });

    enqueueSnackbar("Assignment deleted successfully", { variant: "success" });
  };

  const handleSave = async (saveData) => {
    // If we're in a saved calculation view, we should not use this function
    // as SavedCalculation.jsx has its own saving mechanism
    if (isSavedCalculation) {
      enqueueSnackbar("Can't save from here. Use the Save button in the header to save changes.", {
        variant: "warning",
      });
      return;
    }
    
    setIsSaving(true);
    setSavingError(null);

    try {
      const calculationData = {
        ...saveData,
        raw_data: rawGradeData,
        categories: categories.map((category) => ({
          name: category.name,
          weight: category.weight,
          assignments: [
            ...(category.assignments || []),
            ...hypotheticalAssignments.filter(
              (a) => a.categoryName === category.name
            ),
          ],
        })),
        overall_grade: calculateWeightedGrade().percentage,
        has_letter_grades: calculateWeightedGrade().hasLetterGrades,
        total_points_earned: categories.reduce((total, category) => {
          return (
            total +
            (category.assignments || []).reduce((sum, assignment) => {
              if (assignment.status === "GRADED") {
                return sum + assignment.score;
              }
              return sum;
            }, 0)
          );
        }, 0),
        total_points_possible: categories.reduce((total, category) => {
          return (
            total +
            (category.assignments || []).reduce((sum, assignment) => {
              if (assignment.status === "GRADED") {
                return sum + assignment.total_points;
              }
              return sum;
            }, 0)
          );
        }, 0),
      };

      const response = await fetch(`${API_URL}/api/grades/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(calculationData),
      });

      if (!response.ok) {
        throw new Error("Failed to save calculation");
      }

      const result = await response.json();
      setSaveDialogOpen(false);
      setHasBeenSaved(true);
      enqueueSnackbar("Calculation saved successfully!", {
        variant: "success",
        action: (key) => (
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              navigate(`/grades/${result.id}`);
            }}
          >
            View
          </Button>
        ),
      });
    } catch (error) {
      setSavingError(error.message);
      enqueueSnackbar("Failed to save calculation", { variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // If we're in a saved calculation view, we should navigate back to the grades list
    if (isSavedCalculation) {
      // Clear the last viewed calculation when resetting
      clearLastViewedCalculation();
      navigate("/grades");
      return;
    }

    // Always show a confirmation dialog
    setResetConfirmOpen(true);
  };

  // Add a function to reset calculator without triggering browser popup
  const performSilentReset = () => {
    // Close the dialog first
    setResetConfirmOpen(false);
    
    // Use the clean reset utility to handle the reset completely outside of React
    cleanResetCalculator();
  };

  if (!categories || categories.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="error">
          No categories defined. Please go back and set up grade categories.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        maxWidth: "100%",
        width: "100%",
        backgroundColor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Reset Calculator</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset the calculator? This will take you back to the category setup screen with no categories.
          </Typography>
          <Typography sx={{ mt: 1, color: 'warning.main' }}>
            Any unsaved changes will be lost.
          </Typography>
          {!user && (
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              Want to save your calculations? Create an account or log in to access this feature.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setResetConfirmOpen(false)} variant="outlined">
            Cancel
          </Button>
          {!user && (
            <Button
              onClick={() => navigate("/login")}
              color="primary" 
              variant="outlined"
            >
              Login
            </Button>
          )}
          <Button
            onClick={() => {
              performSilentReset();
            }}
            color="primary"
            variant="contained"
          >
            Reset Calculator
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Content */}
      <Grid container spacing={3} sx={{ width: "100%", mx: 0 }}>
        {/* Left Panel - Grade Summary & Category Breakdown */}
        <Grid item xs={12} md={5} lg={4} xl={3}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              height: "100%",
            }}
          >
            <GradeSummary
              finalGrade={{
                percentage: calculateWeightedGrade().percentage,
                hasLetterGrades: calculateWeightedGrade().hasLetterGrades,
              }}
              whatIfMode={whatIfMode}
              setWhatIfMode={setWhatIfMode}
              targetGrade={targetGrade}
              setTargetGrade={setTargetGrade}
            />

            <SaveCalculationDialog
              open={saveDialogOpen}
              onClose={() => {
                setSaveDialogOpen(false);
                setSavingError(null);
              }}
              onSave={handleSave}
              loading={isSaving}
              error={savingError}
              calculationData={{
                categories,
                hypotheticalAssignments,
                rawGradeData,
              }}
            />

            {mode === "blackboard" && (
              <CategoryBreakdown
                categories={categories}
                whatIfMode={whatIfMode}
                hypotheticalAssignments={hypotheticalAssignments}
                calculateCategoryGrade={calculateCategoryGrade}
                setSelectedCategory={setSelectedCategory}
                setDialogOpen={setDialogOpen}
                upcomingByCategory={categories.reduce((acc, category) => {
                  acc[category.name] = (category.assignments || []).filter(
                    (a) => a.status === "UPCOMING"
                  ).length;
                  return acc;
                }, {})}
              />
            )}
          </Box>
        </Grid>

        {/* Right Panel - Assignment Details */}
        <Grid item xs={12} md={7} lg={8} xl={9}>
          {mode === "manual" ? (
            <div>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: "16px" 
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      backgroundColor: isDark 
                        ? "transparent"
                        : alpha(theme.palette.primary.main, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.palette.primary.main,
                      border: isDark
                        ? `1px solid ${alpha(theme.palette.primary.main, 0.5)}`
                        : "none",
                    }}
                  >
                    <BarChart2 size={24} />
                  </div>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Manual Grade Breakdown
                  </Typography>
                </div>
                
                {/* Add Calculate Another button for manual mode */}
                {showCalculateAnotherButton && (
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    startIcon={<RefreshCw size={18} />}
                    size="medium"
                    sx={{
                      borderRadius: "12px",
                    }}
                  >
                    Calculate Another
                  </Button>
                )}
              </div>
              <ManualGradeTable
                categories={categories}
                manualGrades={manualGrades}
                whatIfMode={whatIfMode}
                onGradeChange={(newGrade) => {
                  const updatedGrades = manualGrades.map((g) =>
                    g.categoryName === newGrade.categoryName ? newGrade : g
                  );
                  if (
                    !updatedGrades.find(
                      (g) => g.categoryName === newGrade.categoryName
                    )
                  ) {
                    updatedGrades.push(newGrade);
                  }
                  setManualGrades(updatedGrades);
                }}
              />
            </div>
          ) : (
            <Box sx={{ height: "100%" }}>
              <AssignmentTable
                categories={categories}
                hypotheticalAssignments={hypotheticalAssignments}
                hypotheticalScores={hypotheticalScores}
                whatIfMode={whatIfMode}
                setSelectedCategory={setSelectedCategory}
                setHypotheticalScores={setHypotheticalScores}
                hiddenAssignments={hiddenAssignments}
                onToggleAssignmentVisibility={handleToggleAssignmentVisibility}
                onDeleteAssignment={handleDeleteAssignment}
                showCalculateAnotherButton={showCalculateAnotherButton}
                onCalculateAnother={handleReset}
              />
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Hypothetical Assignment Dialog */}
      <HypotheticalAssignmentDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedCategory(null);
        }}
        onAdd={(newAssignment) => {
          setHypotheticalAssignments([
            ...hypotheticalAssignments,
            newAssignment,
          ]);
          setDialogOpen(false);
          setSelectedCategory(null);
        }}
        categoryName={selectedCategory}
      />
    </Box>
  );
};

export default Results;
