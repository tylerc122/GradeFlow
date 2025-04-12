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
    // Clean differently for percentage vs letter
    const trimmedValue = newValue.trim();

    if (inputType === 'letter') {
      const cleanedValue = trimmedValue.toUpperCase();
      // Allow typing invalid intermediate chars, but don't update state if invalid
      if (cleanedValue && !isLetterGrade(cleanedValue)) {
        return; 
      }
      onGradeChange({
        categoryName,
        grade: cleanedValue,
        isLetter: true,
        value: cleanedValue ? letterGradeToPoints(cleanedValue) : 0,
      });
    } else if (inputType === 'percentage') {
      // Allow empty string through
      if (trimmedValue === '') {
        onGradeChange({ categoryName, grade: "", isLetter: false, value: 0 });
        return;
      }

      // Check 1: Invalid characters (allow only digits and one optional dot)
      const validPattern = /^[0-9]*\.?[0-9]*$/; 
      if (!validPattern.test(trimmedValue)) {
        return; // Prevent update if invalid characters are present
      }

      // Check 2: Length of integer part (max 3 digits)
      const parts = trimmedValue.split('.');
      if (parts[0].length > 3) {
        return; // Prevent update if more than 3 digits before decimal
      }

      // Check 3: Value range (0-100) using isPercentage
      // Allow potentially valid intermediate values like "9." or "100."
      if (!isPercentage(trimmedValue)) {
         const endsWithDot = trimmedValue.endsWith('.');
         const numberWithoutDot = endsWithDot ? trimmedValue.slice(0, -1) : trimmedValue;
         // Re-check if the number part is valid IF it ends with a dot
         if (!endsWithDot || !isPercentage(numberWithoutDot)) {
             return; // Not a valid number and not a valid intermediate ending in '.'
         }
         // If it's like "9.", proceed, parseFloat will handle it in onGradeChange call
      }

      // If validation passes or it's a valid intermediate state, update
      onGradeChange({
        categoryName,
        grade: trimmedValue, // Keep the raw valid input
        isLetter: false,
        value: parseFloat(trimmedValue) || 0, // Calculate numeric value
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
      : "Please enter a valid percentage (0-100)";
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
                      placeholder={inputType === 'letter' ? "A-" : "95"}
                      inputProps={{
                        type: "text",
                        inputMode: "decimal",
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
