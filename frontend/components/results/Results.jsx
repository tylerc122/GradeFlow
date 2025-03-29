import React, { useState } from "react";
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
import { RefreshCw } from "lucide-react";
import { useAuth } from "../../src/contexts/AuthContext";
import { useCalculator } from "../../src/contexts/CalculatorContext";
import SaveCalculationDialog from "../dialogs/SaveCalculationDialog";
import { GradeSummary } from "./GradeSummary";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { AssignmentTable } from "./AssignmentTable";
import { HypotheticalAssignmentDialog } from "../dialogs/HypotheticalAssignmentDialog";
import ManualGradeTable from "./ManualGradeTable";
import { letterGradeToPoints, isLetterGrade } from "../../src/utils/letterGradeUtils";

const Results = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  // Get state from context
  const {
    categories,
    setCategories,
    mode,
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
    showCalculateAnotherButton,
  } = useCalculator();

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

    const totalEarned = visibleAssignments.reduce((sum, a) => {
      const scoreKey = `${categoryName}-${a.name}`;
      const score = hypotheticalScores[scoreKey]?.score ?? a.score;
      return sum + score;
    }, 0);

    const totalPossible = visibleAssignments.reduce(
      (sum, a) => sum + a.total_points,
      0
    );

    return totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
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
    setHiddenAssignments((prev) =>
      prev.includes(assignmentKey)
        ? prev.filter((key) => key !== assignmentKey)
        : [...prev, assignmentKey]
    );
  };

  const handleDeleteAssignment = (categoryName, assignmentName) => {
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

    setHypotheticalAssignments((prev) =>
      prev.filter(
        (a) => !(a.categoryName === categoryName && a.name === assignmentName)
      )
    );

    enqueueSnackbar("Assignment deleted successfully", { variant: "success" });
  };

  const handleSave = async (saveData) => {
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

      const response = await fetch("http://localhost:8000/api/grades/save", {
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
    if (!user || (user && hasBeenSaved)) {
      resetCalculator();
      setActiveStep(0);
      setIsResultsView(false);
    } else {
      setResetConfirmOpen(true);
    }
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
      >
        <DialogTitle>Start New Calculation?</DialogTitle>
        <DialogContent>
          <Typography>
            {user && !hasBeenSaved
              ? "Your current calculation hasn't been saved. All progress will be lost if you continue."
              : "All progress will be lost if you continue. Consider creating an account to save your calculations."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              resetCalculator();
              setActiveStep(0);
              setIsResultsView(false);
              setResetConfirmOpen(false);
            }}
            color="primary"
            variant="contained"
          >
            Continue
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

      {/* Navigation Buttons */}
      {showCalculateAnotherButton && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            gap: 2,
            mt: 4,
            mb: 4,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleReset}
            startIcon={<RefreshCw size={18} />}
            size="large"
            sx={{
              px: 4,
              minWidth: 120,
              borderRadius: "12px",
            }}
          >
            Calculate Another
          </Button>

          {user && (
            <Button
              variant="contained"
              onClick={() => setSaveDialogOpen(true)}
              size="large"
              sx={{
                px: 4,
                minWidth: 120,
                borderRadius: "12px",
                background: "var(--gradient-primary)",
              }}
            >
              Save Calculation
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Results;
