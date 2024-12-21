import React, { useRef } from "react";
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
} from "@mui/material";

export const AssignmentTable = ({
  categories,
  hypotheticalAssignments,
  hypotheticalScores,
  whatIfMode,
  setSelectedCategory,
  setHypotheticalScores,
}) => {
  const inputRef = useRef(null);

  const handleScoreEdit = (categoryName, assignment, newScore) => {
    setHypotheticalScores((prev) => ({
      ...prev,
      [`${categoryName}-${assignment.name}`]: {
        ...assignment,
        score: parseFloat(newScore) || 0,
        categoryName,
        isHypothetical: true,
      },
    }));
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.target.blur();
    }
  };

  const handleInputClick = (e) => {
    e.target.select(); // This will select all text in the input
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Detailed Assignment Breakdown
      </Typography>
      {categories.map((category, categoryIndex) => (
        <Box key={categoryIndex} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {category.name}
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Assignment</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">Score</TableCell>
                  <TableCell align="right">Total Points</TableCell>
                  <TableCell align="right">Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ...category.assignments,
                  ...hypotheticalAssignments
                    .filter((a) => a.categoryName === category.name)
                    .map((a) => ({ ...a, isHypothetical: true })),
                ].map((assignment, assignmentIndex) => {
                  const hypotheticalKey = `${category.name}-${assignment.name}`;
                  const hypotheticalData = hypotheticalScores[hypotheticalKey];
                  const isEditable =
                    whatIfMode &&
                    (assignment.status === "UPCOMING" ||
                      assignment.isHypothetical);
                  const currentScore =
                    hypotheticalData?.score ?? assignment.score;
                  const percentage =
                    (currentScore / assignment.total_points) * 100;

                  return (
                    <TableRow
                      key={assignmentIndex}
                      sx={{
                        backgroundColor: assignment.isHypothetical
                          ? "action.hover"
                          : assignment.status === "UPCOMING"
                          ? hypotheticalData
                            ? "action.hover"
                            : "grey.100"
                          : "inherit",
                      }}
                    >
                      <TableCell>
                        {assignment.name}
                        {assignment.isHypothetical && (
                          <Chip
                            size="small"
                            label="Hypothetical"
                            color="info"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">{assignment.status}</TableCell>
                      <TableCell align="right">
                        {isEditable ? (
                          <TextField
                            inputRef={inputRef}
                            variant="standard"
                            type="text"
                            value={currentScore || ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^\d.]/g,
                                ""
                              );
                              handleScoreEdit(category.name, assignment, value);
                            }}
                            onKeyPress={handleKeyPress}
                            onClick={handleInputClick}
                            inputProps={{
                              style: { textAlign: "right" },
                            }}
                            sx={{
                              "& input": {
                                p: 0,
                                textAlign: "right",
                              },
                              "& .MuiInput-underline:before": {
                                borderBottom: assignment.isHypothetical
                                  ? "2px dashed #1976d2"
                                  : !hypotheticalData
                                  ? "2px solid #ffd700"
                                  : "1px solid rgba(0, 0, 0, 0.42)",
                              },
                              "& .MuiInput-underline:hover:before": {
                                borderBottom: "2px solid #1976d2 !important",
                              },
                              "& .MuiInput-underline.Mui-focused:before": {
                                borderBottom: "2px solid #1976d2 !important",
                              },
                            }}
                          />
                        ) : (
                          currentScore
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {assignment.total_points}
                      </TableCell>
                      <TableCell align="right">
                        {!isNaN(percentage) ? `${percentage.toFixed(1)}%` : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Paper>
  );
};

export default AssignmentTable;
