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
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
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

  const handleInputTypeChange = (event) => {
    const newType = event.target.value;
    // Clear all grades when switching input type
    categories.forEach(category => {
      onGradeChange({
        categoryName: category.name,
        grade: "",
        isLetter: newType === 'letter',
        value: 0,
      });
    });
  };

  const handleGradeChange = (categoryName, newValue) => {
    // Clean up the input - trim spaces and convert to uppercase for letter grades
    const cleanedValue = newValue.trim().toUpperCase();

    // Validate based on input type
    if (cleanedValue) {
      if (inputType === 'letter' && !isLetterGrade(cleanedValue)) {
        return;
      }
      if (inputType === 'percentage' && !isPercentage(cleanedValue)) {
        return;
      }
    }

    onGradeChange({
      categoryName,
      grade: cleanedValue,
      isLetter: inputType === 'letter',
      value: inputType === 'letter'
        ? letterGradeToPoints(cleanedValue)
        : parseFloat(cleanedValue),
    });
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
      sx={{ borderRadius: 2, overflow: "hidden" }}
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
                      value={gradeData.grade || ""}
                      onChange={(e) =>
                        handleGradeChange(category.name, e.target.value)
                      }
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
