/**
 * Subcomponent of GradeInput.jsx. Let's user input grades manually #LAME.
 */
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
    // Allow empty strings during editing (only update local state)
    const trimmedValue = value.trim();
    
    // Validate input based on input type
    if (inputType === "letter") {
      // For letter grades, only allow valid letter grade characters (A-F plus +/-)
      const validLetterPattern = /^[A-Fa-f][-+]?$/;
      if (trimmedValue && !validLetterPattern.test(trimmedValue)) {
        return; // Reject invalid letter grade formats
      }
    } else if (inputType === "percentage") {
      // For percentages, only allow numbers and one decimal point
      const validPercentagePattern = /^[0-9]*\.?[0-9]*$/;
      if (!validPercentagePattern.test(value)) {
        return; // Reject any input with invalid characters
      }
      
      // Additional percentage validation checks
      if (trimmedValue) {
        // Check for max 3 digits before decimal
        const parts = value.split('.');
        if (parts[0].length > 3) {
          return; // Reject more than 3 digits before decimal
        }
        
        // Check valid numeric range (allow intermediate values like "9.")
        if (!value.endsWith('.')) {
          const numValue = parseFloat(value);
          if (!isNaN(numValue) && (numValue < 0 || numValue > 100)) {
            return; // Reject values outside 0-100 range
          }
        }
      }
    }
    
    // Update local state only if validation passed
    setCategoryGrades((prev) => ({
      ...prev,
      [categoryName]: value,
    }));
  };

  const handleGradeBlur = (categoryName, value) => {
    // Get current value
    let finalValue = value || "";
    
    // If empty, leave it empty in local state but use 0 for calculations
    const trimmedValue = finalValue.trim();
    const isEmpty = !trimmedValue;
    
    // Update the local state with properly formatted value
    if (!isEmpty) {
      const formattedValue = inputType === "letter" 
        ? trimmedValue.toUpperCase() 
        : trimmedValue;
      
      setCategoryGrades((prev) => ({
        ...prev,
        [categoryName]: formattedValue,
      }));
      
      finalValue = formattedValue;
    }
    
    // Now update the parent component with all grades
    const newGrades = [];
    
    // Create array of all grades for parent component
    Object.entries(categoryGrades).forEach(([catName, grade]) => {
      // Use the new value for the current field, existing values for others
      const currentGrade = catName === categoryName ? finalValue : grade;
      const currentTrimmed = currentGrade ? currentGrade.trim() : "";
      
      if (catName === categoryName || currentTrimmed) {
        newGrades.push({
          categoryName: catName,
          grade: currentTrimmed,
          isLetter: inputType === "letter",
          value: inputType === "letter"
            ? (currentTrimmed ? letterGradeToPoints(currentTrimmed) : 0)
            : (currentTrimmed ? parseFloat(currentTrimmed) : 0),
        });
      }
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
              value={categoryGrades[category.name] === "0" ? "" : categoryGrades[category.name]}
              onChange={(e) => handleGradeChange(category.name, e.target.value)}
              onBlur={(e) => handleGradeBlur(category.name, e.target.value)}
              error={!!getGradeError(categoryGrades[category.name])}
              helperText={getGradeError(categoryGrades[category.name])}
              disabled={!inputType}
              sx={{ width: 150 }}
              placeholder={inputType === 'letter' ? "A-" : "95"}
              inputProps={{
                type: "text",
                inputMode: inputType === 'letter' ? "text" : "decimal",
                pattern: inputType === 'letter' 
                  ? "^[A-Za-z][+-]?$"
                  : "^[0-9]+(?:\\.[0-9]+)?$",
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
