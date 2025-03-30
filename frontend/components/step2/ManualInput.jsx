import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Stack,
  Alert,
  alpha,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
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
  const [inputType, setInputType] = useState(null); // 'letter' or 'percentage'

  const handleInputTypeChange = (event) => {
    const newType = event.target.value;
    setInputType(newType);
    // Clear all grades when switching input type
    setCategoryGrades(
      categories.reduce(
        (acc, cat) => ({
          ...acc,
          [cat.name]: "",
        }),
        {}
      )
    );
  };

  const handleGradeChange = (categoryName, value) => {
    // Clean up the input - trim spaces and convert to uppercase for letter grades
    const cleanedValue = value.trim().toUpperCase();

    // Validate based on input type
    if (cleanedValue) {
      if (inputType === 'letter' && !isLetterGrade(cleanedValue)) {
        return;
      }
      if (inputType === 'percentage' && !isPercentage(cleanedValue)) {
        return;
      }
    }

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
        isLetter: inputType === 'letter',
        value: inputType === 'letter'
          ? letterGradeToPoints(currentGrade)
          : parseFloat(currentGrade),
      };
    });

    setGrades(newGrades);
  };

  const getGradeError = (value) => {
    if (!value) return "";
    if (inputType === 'letter' && isLetterGrade(value)) return "";
    if (inputType === 'percentage' && isPercentage(value)) return "";
    return inputType === 'letter' 
      ? "Please enter a valid letter grade (A+, A, A-, etc.)"
      : "Please enter a valid percentage (0-100)";
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
        Choose your preferred grade input method and enter all category grades consistently.
      </Alert>

      <FormControl component="fieldset">
        <RadioGroup
          row
          value={inputType}
          onChange={handleInputTypeChange}
          sx={{ mb: 2 }}
        >
          <FormControlLabel
            value="letter"
            control={<Radio />}
            label="Letter Grades (A+, A, A-, etc.)"
          />
          <FormControlLabel
            value="percentage"
            control={<Radio />}
            label="Percentages (0-100)"
          />
        </RadioGroup>
      </FormControl>

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
              disabled={!inputType}
              sx={{ width: 150 }}
              placeholder={inputType === 'letter' ? "A-" : "95"}
              inputProps={{
                type: "text",
                inputMode: "decimal",
                pattern: inputType === 'letter' 
                  ? "^[A-Za-z][+-]?$"
                  : "^[0-9]+(?:\\.[0-9]+)?$",
                onKeyPress: (e) => {
                  const value = e.target.value + e.key;
                  if (value && inputType === 'letter' && !isLetterGrade(value)) {
                    e.preventDefault();
                  }
                  if (value && inputType === 'percentage' && !isPercentage(value)) {
                    e.preventDefault();
                  }
                },
                onPaste: (e) => {
                  const pastedValue = e.clipboardData.getData('text').trim().toUpperCase();
                  if (pastedValue && inputType === 'letter' && !isLetterGrade(pastedValue)) {
                    e.preventDefault();
                  }
                  if (pastedValue && inputType === 'percentage' && !isPercentage(pastedValue)) {
                    e.preventDefault();
                  }
                }
              }}
            />
          </Box>
        </Paper>
      ))}

      {inputType === 'letter' && (
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
      )}
    </Stack>
  );
};

export default ManualInput;
