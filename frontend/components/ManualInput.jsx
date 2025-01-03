import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Stack,
  Alert,
  alpha,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";

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

const ManualInput = ({ categories, setGrades }) => {
  const [categoryGrades, setCategoryGrades] = useState(
    categories.reduce(
      (acc, cat) => ({
        ...acc,
        [cat.name]: "",
      }),
      {}
    )
  );

  // Helper function to check if input is a valid letter grade
  const isLetterGrade = (value) => {
    return LETTER_GRADES.hasOwnProperty(value.toUpperCase());
  };

  // Helper function to check if input is a valid percentage
  const isPercentage = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  const handleGradeChange = (categoryName, value) => {
    // Clean up the input - trim spaces and convert to uppercase for letter grades
    const cleanedValue = value.trim().toUpperCase();

    setCategoryGrades((prev) => ({
      ...prev,
      [categoryName]: cleanedValue,
    }));

    // Update parent component with all grades
    const newGrades = Object.entries(categoryGrades).map(([name, grade]) => ({
      categoryName: name,
      grade: grade,
      isLetter: isLetterGrade(grade),
      value: isLetterGrade(grade)
        ? LETTER_GRADES[grade.toUpperCase()].points
        : isPercentage(grade)
        ? parseFloat(grade)
        : null,
    }));

    setGrades(newGrades);
  };

  const getGradeError = (value) => {
    if (!value) return "";
    if (isLetterGrade(value) || isPercentage(value)) return "";
    return "Enter a valid percentage (0-100) or letter grade (A+, A, A-, etc.)";
  };

  return (
    <Stack spacing={3}>
      <Alert
        severity="info"
        sx={{
          backgroundColor: alpha("#2196f3", 0.08),
          border: "1px solid",
          borderColor: alpha("#2196f3", 0.2),
        }}
      >
        Enter your category grades as either percentages (0-100) or letter
        grades (A+, A, A-, etc.). Mix and match as needed.
      </Alert>

      {categories.map((category, index) => (
        <Paper
          key={index}
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <AssignmentIcon sx={{ color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {category.name}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Weight: {category.weight}%
              </Typography>
            </Box>

            <TextField
              label="Grade"
              value={categoryGrades[category.name]}
              onChange={(e) => handleGradeChange(category.name, e.target.value)}
              error={!!getGradeError(categoryGrades[category.name])}
              helperText={getGradeError(categoryGrades[category.name])}
              sx={{ width: 150 }}
              placeholder="95 or A-"
            />
          </Box>
        </Paper>
      ))}

      <Paper
        elevation={1}
        sx={{
          p: 2,
          mt: 2,
          backgroundColor: alpha("#f5f5f5", 0.5),
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          Letter Grade Scale: A+ (≥97%), A (≥93%), A- (≥90%), B+ (≥87%), B
          (≥83%), B- (≥80%), C+ (≥77%), C (≥73%), C- (≥70%), D+ (≥67%), D
          (≥63%), D- (≥60%), F (&lt;60%)
        </Typography>
      </Paper>
    </Stack>
  );
};

export default ManualInput;
