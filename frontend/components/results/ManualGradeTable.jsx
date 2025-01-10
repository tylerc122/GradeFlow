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

const ManualGradeTable = ({
  categories,
  manualGrades,
  whatIfMode,
  onGradeChange,
}) => {
  const handleGradeChange = (categoryName, newValue) => {
    // Support both percentage and letter grades
    const isLetterGrade = isNaN(newValue) && newValue.trim().length > 0;

    // If it's a number, ensure we preserve all digits
    let parsedValue = isLetterGrade ? 0 : parseFloat(newValue);

    onGradeChange({
      categoryName,
      grade: newValue,
      isLetter: isLetterGrade,
      value: isLetterGrade ? 0 : parsedValue,
    });
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
                      sx={{ width: "100px" }}
                      placeholder="95 or A"
                      inputProps={{
                        type: "text", // Changed from "number" to "text" to prevent browser-based number formatting
                        inputMode: "decimal", // Better mobile keyboard for numbers but allows text
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
