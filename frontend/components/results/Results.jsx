import React, { useState } from "react";
import { Box, Stack, Paper, Typography } from "@mui/material";
import { useAuth } from "../../src/contexts/AuthContext";
import SaveCalculationDialog from "../dialogs/SaveCalculationDialog";
import SaveIcon from "@mui/icons-material/Save";
import Button from "@mui/material/Button";
import { GradeSummary } from "./GradeSummary";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { AssignmentTable } from "./AssignmentTable";
import { HypotheticalAssignmentDialog } from "../dialogs/HypotheticalAssignmentDialog";
import ManualGradeTable from "./ManualGradeTable.jsx";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

const LETTER_GRADES = {
  "A+": { points: 4.0, minPercent: 97 },
  A: { points: 4.0, minPercent: 93 },
  "A-": { points: 3.7, minPercent: 90 },
  "B+": { points: 3.3, minPercent: 87 },
  B: { points: 3.0, minPercent: 83 },
  "B-": { points: 2.7, minPercent: 80 },
  "C+": { points: 2.3, minPercent: 77 },
  C: { points: 2.0, minPercent: 73 },
  "C-": { points: 1.7, minPercent: 70 },
  "D+": { points: 1.3, minPercent: 67 },
  D: { points: 1.0, minPercent: 63 },
  "D-": { points: 0.7, minPercent: 60 },
  F: { points: 0.0, minPercent: 0 },
};

const Results = ({
  categories,
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
  calculateWeightedGrade,
  rawGradeData,
  wrappedCalculateCategoryGrade,
  hiddenAssignments,
  onToggleAssignmentVisibility,
  setCategories,
  calculateCategoryGrade,
}) => {
  const { user } = useAuth();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savingError, setSavingError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Handler for deleting assignments
  const handleDeleteAssignment = (categoryName, assignmentName) => {
    // Remove from categories
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

    // Also remove from hypothetical assignments if present
    setHypotheticalAssignments((prev) =>
      prev.filter(
        (a) => !(a.categoryName === categoryName && a.name === assignmentName)
      )
    );

    // Show feedback
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
            ...category.assignments,
            ...hypotheticalAssignments.filter(
              (a) => a.categoryName === category.name
            ),
          ],
        })),
        overall_grade: calculateWeightedGrade(),
        total_points_earned: categories.reduce((total, category) => {
          return (
            total +
            category.assignments.reduce((sum, assignment) => {
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
            category.assignments.reduce((sum, assignment) => {
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
      enqueueSnackbar("Calculation saved successfully!", {
        variant: "success",
        action: (key) => (
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              navigate(`/calculator/saved/${result.id}`);
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

  if (!categories || categories.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="error">
          No categories defined. Please go back and set up grade categories.
        </Typography>
      </Paper>
    );
  }

  if (
    (mode === "blackboard" && !parsedGrades?.assignments) ||
    (mode === "manual" && (!manualGrades || manualGrades.length === 0))
  ) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="error">
          No grade data available. Please go back and enter your grades.
        </Typography>
      </Paper>
    );
  }

  const calculateFinalGrade = () => {
    if (mode === "manual") {
      return calculateWeightedGrade();
    }

    // Use the wrapped calculation function that accounts for hidden assignments
    return categories.reduce((total, category) => {
      const categoryHypotheticals = hypotheticalAssignments.filter(
        (a) => a.categoryName === category.name
      );

      const allAssignments = [
        ...(category.assignments || []),
        ...categoryHypotheticals,
      ];

      // Use wrappedCalculateCategoryGrade instead of calculateCategoryGrade
      const categoryGrade = wrappedCalculateCategoryGrade(
        allAssignments,
        category.name
      );
      console.log(
        `Category ${category.name} grade with hidden: ${categoryGrade}`
      );
      return total + categoryGrade * (category.weight / 100);
    }, 0);
  };

  // Calculate final grade based on mode
  const finalGrade = {
    percentage: calculateFinalGrade(), // Use new calculation function
    hasLetterGrades: mode === "manual" && manualGrades.some((g) => g.isLetter),
  };

  const upcomingByCategory =
    mode === "blackboard"
      ? categories.reduce((acc, category) => {
          acc[category.name] = (category.assignments || []).filter(
            (a) => a.status === "UPCOMING"
          ).length;
          return acc;
        }, {})
      : categories.reduce((acc, category) => {
          acc[category.name] = 0;
          return acc;
        }, {});

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        maxWidth: "100%",
        ...(mode === "blackboard" && {
          display: "grid",
          gridTemplateColumns: "1050px 1050px",
          columnGap: "50px",
          width: "2200px",
          height: "calc(100vh - 280px)",
          margin: "0 auto",
        }),
        backgroundColor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* Left Panel */}
      <Box
        sx={{
          height: "100%",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#888",
            borderRadius: "4px",
            "&:hover": {
              background: "#555",
            },
          },
        }}
      >
        <Stack spacing={3}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <GradeSummary
              finalGrade={finalGrade}
              whatIfMode={whatIfMode}
              setWhatIfMode={setWhatIfMode}
              targetGrade={targetGrade}
              setTargetGrade={setTargetGrade}
            />
          </Box>

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
              finalGrade,
            }}
          />

          {mode === "blackboard" && (
            <CategoryBreakdown
              mode={mode}
              categories={categories}
              manualGrades={manualGrades}
              whatIfMode={whatIfMode}
              hypotheticalAssignments={hypotheticalAssignments}
              calculateCategoryGrade={wrappedCalculateCategoryGrade}
              upcomingByCategory={upcomingByCategory}
              setSelectedCategory={setSelectedCategory}
              setDialogOpen={setDialogOpen}
            />
          )}
        </Stack>
      </Box>

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
        <Paper
          elevation={2}
          sx={{
            height: "100%",
            borderRadius: 3,
            background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              p: 4,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#888",
                borderRadius: "4px",
                "&:hover": {
                  background: "#555",
                },
              },
            }}
          >
            <AssignmentTable
              categories={categories}
              hypotheticalAssignments={hypotheticalAssignments}
              hypotheticalScores={hypotheticalScores}
              whatIfMode={whatIfMode}
              setSelectedCategory={setSelectedCategory}
              setHypotheticalScores={setHypotheticalScores}
              hiddenAssignments={hiddenAssignments}
              onToggleAssignmentVisibility={onToggleAssignmentVisibility}
              onDeleteAssignment={handleDeleteAssignment}
              calculateCategoryGrade={wrappedCalculateCategoryGrade}
            />
          </Box>
        </Paper>
      )}

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
