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
import {
  isLetterGrade,
  isPercentage,
  LETTER_GRADES,
  letterGradeToPoints,
} from "../../src/utils/letterGradeUtils";

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

  const handleGradeChange = (categoryName, value) => {
    // Clean up the input - trim spaces and convert to uppercase for letter grades
    const cleanedValue = value.trim().toUpperCase();

    setCategoryGrades((prev) => ({
      ...prev,
      [categoryName]: cleanedValue,
    }));

    // Update parent component with all grades
    const newGrades = Object.entries(categoryGrades).map(([name, grade]) => {
      const currentGrade = name === categoryName ? cleanedValue : grade;
      return {
        categoryName: name,
        grade: currentGrade,
        isLetter: isLetterGrade(currentGrade),
        value: isLetterGrade(currentGrade)
          ? letterGradeToPoints(currentGrade)
          : isPercentage(currentGrade)
          ? parseFloat(currentGrade)
          : null,
      };
    });

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
              inputProps={{
                type: "text",
                inputMode: "decimal",
              }}
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
