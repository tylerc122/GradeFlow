import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { GradeSummary } from "./GradeSummary";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { AssignmentTable } from "./AssignmentTable";
import { HypotheticalAssignmentDialog } from "../dialogs/HypotheticalAssignmentDialog";

const Results = ({
  categories,
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
  if (!parsedGrades || !categories || categories.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="error">
          No grade data available. Please go back and enter your grades.
        </Typography>
      </Paper>
    );
  }

  // Count upcoming assignments per category
  const upcomingByCategory = categories.reduce((acc, category) => {
    acc[category.name] = category.assignments.filter(
      (a) => a.status === "UPCOMING"
    ).length;
    return acc;
  }, {});

  const weightedGrade = calculateWeightedGrade();

  return (
    <Box>
      <GradeSummary
        weightedGrade={weightedGrade}
        whatIfMode={whatIfMode}
        setWhatIfMode={setWhatIfMode}
        targetGrade={targetGrade}
        setTargetGrade={setTargetGrade}
      />

      <CategoryBreakdown
        categories={categories}
        whatIfMode={whatIfMode}
        hypotheticalAssignments={hypotheticalAssignments}
        calculateCategoryGrade={calculateCategoryGrade}
        upcomingByCategory={upcomingByCategory}
        setSelectedCategory={setSelectedCategory}
        setDialogOpen={setDialogOpen}
      />

      <AssignmentTable
        categories={categories}
        hypotheticalAssignments={hypotheticalAssignments}
        hypotheticalScores={hypotheticalScores}
        whatIfMode={whatIfMode}
        setSelectedCategory={setSelectedCategory}
        setHypotheticalScores={setHypotheticalScores}
      />

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
