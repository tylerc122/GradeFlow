import React from "react";
import { Box, Paper, Typography, Stack } from "@mui/material";
import { GradeSummary } from "./GradeSummary";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { AssignmentTable } from "./AssignmentTable";
import { HypotheticalAssignmentDialog } from "../dialogs/HypotheticalAssignmentDialog";
import ManualGradeTable from "./ManualGradeTable.jsx";

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

// Helper function to convert percentage to letter grade
const percentageToLetter = (percentage) => {
  for (const [letter, data] of Object.entries(LETTER_GRADES)) {
    if (percentage >= data.minPercent) {
      return letter;
    }
  }
  return "F";
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
  calculateCategoryGrade,
  calculateWeightedGrade,
}) => {
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

  // Calculate final grade based on mode
  const calculateFinalGrade = () => {
    if (mode === "blackboard") {
      return {
        percentage: calculateWeightedGrade(),
        hasLetterGrades: false,
      };
    } else {
      // For manual mode
      let totalWeightedPoints = 0;
      let totalWeight = 0;
      let hasLetterGrades = false;

      categories.forEach((category) => {
        const grade = manualGrades.find(
          (g) => g.categoryName === category.name
        );
        if (grade) {
          if (grade.isLetter) {
            hasLetterGrades = true;
            totalWeightedPoints +=
              LETTER_GRADES[grade.grade].points * category.weight;
          } else {
            totalWeightedPoints += grade.value * category.weight;
          }
          totalWeight += category.weight;
        }
      });

      const percentage = totalWeightedPoints / totalWeight;
      return {
        percentage,
        hasLetterGrades,
      };
    }
  };

  const finalGrade = calculateFinalGrade();
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
        maxWidth: mode === "manual" ? "800px" : "100%",
        margin: mode === "manual" ? "0 auto" : "0",
        ...(mode === "blackboard" && {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          height: "calc(100vh - 280px)",
          maxWidth: "100%",
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
          <GradeSummary
            finalGrade={finalGrade}
            whatIfMode={whatIfMode}
            setWhatIfMode={setWhatIfMode}
            targetGrade={targetGrade}
            setTargetGrade={setTargetGrade}
          />

          {mode === "blackboard" && (
            <CategoryBreakdown
              mode={mode}
              categories={categories}
              manualGrades={manualGrades}
              whatIfMode={whatIfMode}
              hypotheticalAssignments={hypotheticalAssignments}
              calculateCategoryGrade={calculateCategoryGrade}
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
