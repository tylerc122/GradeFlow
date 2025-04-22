/**
 * Component of the manual grade results screen.
 * Same as AssignmentTable.jsx but for manual grades, much simpler.
 */
import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { isLetterGrade, isPercentage, letterGradeToPoints } from "../../src/utils/letterGradeUtils";

const ManualGradeTable = ({
  categories,
  manualGrades,
  whatIfMode,
  onGradeChange,
}) => {
  // Determine input type from existing grades
  const inputType = React.useMemo(() => {
    if (!manualGrades.length) return null;
    return manualGrades[0].isLetter ? 'letter' : 'percentage';
  }, [manualGrades]);

  const handleGradeChange = (categoryName, newValue) => {
    // Validate differently based on input type
    if (inputType === 'letter') {
      const trimmedValue = newValue.trim();
      
      // For letter grades, only allow valid letter grade characters (A-F plus +/-)
      const validLetterPattern = /^[A-Fa-f][-+]?$/i;
      if (trimmedValue && !validLetterPattern.test(trimmedValue)) {
        return; // Don't update state if invalid letter format
      }
      
      // Convert to uppercase for consistency
      const cleanedValue = trimmedValue.toUpperCase();
      
      onGradeChange({
        categoryName,
        grade: cleanedValue,
        isLetter: true,
        value: cleanedValue ? letterGradeToPoints(cleanedValue) : 0,
      });
    } else if (inputType === 'percentage') {
      // Allow empty string through
      if (newValue === '') {
        onGradeChange({ categoryName, grade: "", isLetter: false, value: 0 });
        return;
      }

      // Check 1: Strict pattern for percentage input - only digits and one optional decimal point
      const validPattern = /^[0-9]*\.?[0-9]*$/; 
      if (!validPattern.test(newValue)) {
        return; // Reject any input with invalid characters
      }

      // Check 2: Length of integer part (max 4 digits to allow 1000)
      const parts = newValue.split('.');
      if (parts[0].length > 4) {
        return; // Reject more than 4 digits before decimal
      }

      // Check 3: Check numeric range (allow intermediate values like "9.", "99.", "999.")
      if (!newValue.endsWith('.')) {
        const numValue = parseFloat(newValue);
        if (!isNaN(numValue) && (numValue < 0 || numValue > 1000)) {
          return; // Reject values outside 0-1000 range
        }
      }

      // If validation passes, update the state
      onGradeChange({
        categoryName,
        grade: newValue, // Keep the raw valid input
        isLetter: false,
        value: parseFloat(newValue) || 0, // Calculate numeric value
      });
    }
  };

  const handleGradeBlur = (categoryName, currentGrade) => {
    // Only set default value on blur if the field is empty
    if (!currentGrade || currentGrade.trim() === '') {
      onGradeChange({
        categoryName,
        grade: "",
        isLetter: inputType === 'letter',
        value: 0,
      });
    }
  };

  const getGradeError = (value) => {
    if (!value) return "";
    if (inputType === 'letter' && isLetterGrade(value)) return "";
    if (inputType === 'percentage' && isPercentage(value)) return "";
    return inputType === 'letter' 
      ? "Please enter a valid letter grade (A+, A, A-, etc.)"
      : "Please enter a valid percentage (0-1000)";
  };

  return (
    <TableContainer
      component={Paper}
      elevation={2}
      sx={{ borderRadius: 2, overflow: "hidden", backgroundColor: "background.default" }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "primary.main" }}>
            <TableCell sx={{ color: "common.white", fontWeight: 600 }}>
              Assignment/Exam
            </TableCell>
            <TableCell sx={{ color: "common.white", fontWeight: 600 }}>
              Grade
            </TableCell>
            <TableCell sx={{ color: "common.white", fontWeight: 600 }}>
              Weight
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((category) => {
            const gradeData =
              manualGrades.find((g) => g.categoryName === category.name) || {};

            return (
              <TableRow key={category.name}>
                <TableCell>
                  <Typography variant="body1">{category.name}</Typography>
                </TableCell>
                <TableCell>
                  {whatIfMode ? (
                    <TextField
                      variant="outlined"
                      size="small"
                      value={(gradeData.grade === "0" || gradeData.grade === "") ? "" : gradeData.grade}
                      onChange={(e) =>
                        handleGradeChange(category.name, e.target.value)
                      }
                      onBlur={() => handleGradeBlur(category.name, gradeData.grade)}
                      onFocus={(event) => event.target.select()}
                      error={!!getGradeError(gradeData.grade)}
                      helperText={getGradeError(gradeData.grade)}
                      disabled={!inputType}
                      sx={{ width: "100px" }}
                      placeholder={inputType === 'letter' ? "A-" : "950"}
                      inputProps={{
                        type: "text",
                        inputMode: inputType === 'letter' ? "text" : "decimal",
                        pattern: inputType === 'letter' 
                          ? "^[A-Za-z][+-]?$"
                          : "^[0-9]+(?:\.[0-9]+)?$",
                      }}
                    />
                  ) : (
                    <Typography>{gradeData.grade || "-"}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography>{category.weight}%</Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ManualGradeTable;
