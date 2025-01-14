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
  Stack,
  IconButton,
  alpha,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TimelineIcon from "@mui/icons-material/Timeline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DeleteIcon from "@mui/icons-material/Delete";

export const AssignmentTable = ({
  categories,
  hypotheticalAssignments,
  hypotheticalScores,
  whatIfMode,
  setSelectedCategory,
  setHypotheticalScores,
  hiddenAssignments = [],
  onToggleAssignmentVisibility,
  onDeleteAssignment,
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
    e.target.select();
  };

  const getStatusColor = (status, isHypothetical) => {
    if (isHypothetical) return "info";
    if (status === "UPCOMING") return "warning";
    return "success";
  };

  const isAssignmentHidden = (assignment) => {
    return hiddenAssignments.includes(
      `${assignment.categoryName}-${assignment.name}`
    );
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        borderRadius: 3,
        background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
      }}
    >
      <Stack spacing={4}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TimelineIcon
            sx={{ fontSize: 32, color: "primary.main", opacity: 0.8 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            Detailed Assignment Breakdown
          </Typography>
        </Box>

        {categories.map((category, categoryIndex) => (
          <Box key={categoryIndex}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
              }}
            >
              <AssignmentIcon sx={{ color: "primary.main" }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 500, color: "text.primary" }}
              >
                {category.name}
              </Typography>
            </Box>

            <TableContainer
              component={Paper}
              elevation={1}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Table size="medium">
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: alpha("#1976d2", 0.04),
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                      }}
                    >
                      Assignment
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                      }}
                    >
                      Score
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                      }}
                    >
                      Total Points
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                      }}
                    >
                      Percentage
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                      }}
                    >
                      Actions
                    </TableCell>
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
                    const hypotheticalData =
                      hypotheticalScores[hypotheticalKey];
                    const isEditable =
                      whatIfMode &&
                      (assignment.status === "UPCOMING" ||
                        assignment.isHypothetical);
                    const currentScore =
                      hypotheticalData?.score ?? assignment.score;
                    const percentage =
                      (currentScore / assignment.total_points) * 100;
                    const isHidden = isAssignmentHidden(assignment);

                    return (
                      <TableRow
                        key={assignmentIndex}
                        sx={{
                          backgroundColor: isHidden
                            ? alpha("#000", 0.04)
                            : assignment.isHypothetical
                            ? alpha("#2196f3", 0.04)
                            : assignment.status === "UPCOMING"
                            ? hypotheticalData
                              ? alpha("#2196f3", 0.04)
                              : alpha("#ff9800", 0.04)
                            : "inherit",
                          "&:hover": {
                            backgroundColor: alpha("#000", 0.02),
                          },
                          textDecoration: isHidden ? "line-through" : "none",
                          opacity: isHidden ? 0.6 : 1,
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {assignment.name}
                            </Typography>
                            {assignment.isHypothetical && (
                              <Chip
                                size="small"
                                label="Hypothetical"
                                color="info"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={assignment.status}
                            color={getStatusColor(
                              assignment.status,
                              assignment.isHypothetical
                            )}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
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
                                handleScoreEdit(
                                  category.name,
                                  assignment,
                                  value
                                );
                              }}
                              onKeyPress={handleKeyPress}
                              onClick={handleInputClick}
                              sx={{
                                width: "80px",
                                "& input": {
                                  textAlign: "center",
                                },
                              }}
                            />
                          ) : (
                            currentScore
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {assignment.total_points}
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color:
                                percentage >= 90
                                  ? "success.main"
                                  : percentage >= 80
                                  ? "primary.main"
                                  : percentage >= 70
                                  ? "warning.main"
                                  : "error.main",
                            }}
                          >
                            {!isNaN(percentage)
                              ? `${percentage.toFixed(1)}%`
                              : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                onToggleAssignmentVisibility(
                                  category.name,
                                  assignment.name
                                )
                              }
                            >
                              {isHidden ? (
                                <VisibilityOffIcon />
                              ) : (
                                <VisibilityIcon />
                              )}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                onDeleteAssignment(
                                  category.name,
                                  assignment.name
                                )
                              }
                              sx={{
                                color: "error.main",
                                "&:hover": {
                                  backgroundColor: alpha("#f44336", 0.08),
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default AssignmentTable;
