import React from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Stack,
  LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { alpha } from "@mui/material/styles";

export const CategoryBreakdown = ({
  categories,
  whatIfMode,
  hypotheticalAssignments,
  calculateCategoryGrade,
  upcomingByCategory,
  setSelectedCategory,
  setDialogOpen,
}) => (
  <Paper
    elevation={2}
    sx={{
      p: 4,
      mb: 3,
      borderRadius: 3,
      background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
    }}
  >
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
      Grade Breakdown by Category
    </Typography>

    <Stack spacing={2}>
      {categories.map((category, index) => {
        const categoryHypotheticals = hypotheticalAssignments.filter(
          (a) => a.categoryName === category.name
        );

        const allAssignments = [
          ...(category.assignments || []),
          ...(categoryHypotheticals || []),
        ];

        const categoryGrade = calculateCategoryGrade(
          allAssignments,
          category.name
        );
        const weightedContribution = categoryGrade * (category.weight / 100);
        const hasUpcoming = upcomingByCategory[category.name] > 0;

        // Get color based on grade
        const getGradeColor = (grade) => {
          if (grade >= 90) return "#4caf50";
          if (grade >= 80) return "#2196f3";
          if (grade >= 70) return "#ff9800";
          return "#f44336";
        };

        const gradeColor = getGradeColor(categoryGrade);

        return (
          <Paper
            key={index}
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              "&:hover": {
                bgcolor: alpha("#000", 0.02),
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <AssignmentIcon sx={{ color: "primary.main" }} />
                  {category.name}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Weight: {category.weight}%
                </Typography>
              </Box>

              {whatIfMode && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  variant="outlined"
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setDialogOpen(true);
                  }}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                >
                  Add Hypothetical
                </Button>
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Progress
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: gradeColor, fontWeight: 500 }}
                >
                  {categoryGrade.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(categoryGrade, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(gradeColor, 0.1),
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: gradeColor,
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {allAssignments.length} assignments
                {hasUpcoming && (
                  <Typography
                    component="span"
                    color="warning.main"
                    sx={{ ml: 1, fontWeight: 500 }}
                  >
                    ({upcomingByCategory[category.name]} upcoming)
                  </Typography>
                )}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Contribution: {weightedContribution.toFixed(2)}%
              </Typography>
            </Box>
          </Paper>
        );
      })}
    </Stack>
  </Paper>
);
