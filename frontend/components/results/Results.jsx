import React from "react";
import { Box, Paper, Typography, Stack } from "@mui/material";
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

  const upcomingByCategory = categories.reduce((acc, category) => {
    acc[category.name] = category.assignments.filter(
      (a) => a.status === "UPCOMING"
    ).length;
    return acc;
  }, {});

  const weightedGrade = calculateWeightedGrade();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 3,
        height: "85vh", // Set a fixed height
        backgroundColor: "background.default",
      }}
    >
      {/* Left Panel */}
      <Box
        sx={{
          overflowY: "auto",
          height: "100%",
          pr: 2,
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
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
        </Stack>
      </Box>

      {/* Right Panel */}
      <Box
        sx={{
          overflowY: "auto",
          height: "100%",
          pr: 2,
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
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
