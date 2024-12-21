import React from "react";
import { Paper, Typography, Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export const CategoryBreakdown = ({
  categories,
  whatIfMode,
  hypotheticalAssignments,
  calculateCategoryGrade,
  upcomingByCategory,
  setSelectedCategory,
  setDialogOpen,
}) => (
  <Paper sx={{ p: 3, mb: 3 }}>
    <Typography variant="h6" gutterBottom>
      Grade Breakdown by Category
    </Typography>
    {categories.map((category, index) => {
      const categoryHypotheticals = hypotheticalAssignments.filter(
        (a) => a.categoryName === category.name
      );

      const allAssignments = [
        ...category.assignments,
        ...categoryHypotheticals,
      ];

      const categoryGrade = calculateCategoryGrade(
        allAssignments,
        category.name
      );
      const weightedContribution = categoryGrade * (category.weight / 100);
      const hasUpcoming = upcomingByCategory[category.name] > 0;

      return (
        <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: "grey.50" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle1">
              {category.name} (Weight: {category.weight}%)
            </Typography>
            {whatIfMode && (
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedCategory(category.name);
                  setDialogOpen(true);
                }}
              >
                Add Hypothetical Assignment
              </Button>
            )}
          </Box>
          <Box sx={{ pl: 2 }}>
            <Typography>Raw Grade: {categoryGrade.toFixed(2)}%</Typography>
            <Typography>
              Weighted Contribution: {weightedContribution.toFixed(2)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {allAssignments.length} assignments
              {hasUpcoming &&
                ` (${upcomingByCategory[category.name]} upcoming)`}
            </Typography>
          </Box>
        </Paper>
      );
    })}
  </Paper>
);
