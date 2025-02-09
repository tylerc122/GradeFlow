import React, { useRef, useState } from "react";
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
  alpha,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TimelineIcon from "@mui/icons-material/Timeline";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import RestoreIcon from "@mui/icons-material/Restore";

export const AssignmentTable = ({
  categories,
  hypotheticalAssignments,
  hypotheticalScores,
  whatIfMode,
  setSelectedCategory,
  setHypotheticalScores,
  hiddenAssignments,
  onToggleAssignmentVisibility,
  onDeleteAssignment,
}) => {
  const inputRef = useRef(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [editedScores, setEditedScores] = useState({});

  const handleScoreEdit = (categoryName, assignment, newValue) => {
    // Remove any non-numeric characters except decimal point
    let cleanValue = newValue.replace(/[^\d.]/g, "");

    // Ensure only one decimal point
    const decimalCount = (cleanValue.match(/\./g) || []).length;
    if (decimalCount > 1) {
      cleanValue = cleanValue.replace(/\./g, (match, index) =>
        index === cleanValue.indexOf(".") ? match : ""
      );
    }

    // Parse the value
    let numericValue = parseFloat(cleanValue);

    const scoreKey = `${categoryName}-${assignment.name}`;
    setEditedScores((prev) => ({
      ...prev,
      [scoreKey]: true,
    }));

    setHypotheticalScores((prev) => ({
      ...prev,
      [scoreKey]: {
        ...assignment,
        score: numericValue || 0,
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

  const handleResetScore = (categoryName, assignment) => {
    const scoreKey = `${categoryName}-${assignment.name}`;
    const newHypotheticalScores = { ...hypotheticalScores };
    delete newHypotheticalScores[scoreKey];
    setHypotheticalScores(newHypotheticalScores);

    const newEditedScores = { ...editedScores };
    delete newEditedScores[scoreKey];
    setEditedScores(newEditedScores);
  };

  const handleDeleteClick = (categoryName, assignment) => {
    setAssignmentToDelete({ categoryName, assignment });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (assignmentToDelete) {
      onDeleteAssignment(
        assignmentToDelete.categoryName,
        assignmentToDelete.assignment.name
      );
    }
    setDeleteDialogOpen(false);
    setAssignmentToDelete(null);
  };

  const getStatusColor = (status, isHypothetical) => {
    if (isHypothetical) return "info";
    if (status === "UPCOMING") return "warning";
    return "success";
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
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {category.name}
              </Typography>
            </Box>

            <TableContainer
              component={Paper}
              elevation={1}
              sx={{ borderRadius: 2 }}
            >
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha("#1976d2", 0.04) }}>
                    <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                      Assignment
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, color: "text.primary" }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, color: "text.primary" }}
                    >
                      Score
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, color: "text.primary" }}
                    >
                      Total Points
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, color: "text.primary" }}
                    >
                      Percentage
                    </TableCell>
                    {whatIfMode && (
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 600, color: "text.primary" }}
                      >
                        Actions
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    ...category.assignments,
                    ...hypotheticalAssignments.filter(
                      (a) => a.categoryName === category.name
                    ),
                  ].map((assignment, assignmentIndex) => {
                    const scoreKey = `${category.name}-${assignment.name}`;
                    const hypotheticalData = hypotheticalScores[scoreKey];
                    const isEdited = editedScores[scoreKey];
                    const currentScore =
                      hypotheticalData?.score ?? assignment.score;
                    const percentage =
                      (currentScore / assignment.total_points) * 100;
                    const isHidden = hiddenAssignments.includes(scoreKey);

                    return (
                      <TableRow
                        key={`${category.name}-${assignment.name}-${assignmentIndex}`}
                        sx={{
                          bgcolor: isHidden
                            ? alpha("#9e9e9e", 0.1)
                            : isEdited
                            ? alpha("#2196f3", 0.08)
                            : "inherit",
                          "&:hover": {
                            bgcolor: alpha("#000", 0.02),
                          },
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
                          {whatIfMode ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                              }}
                            >
                              <TextField
                                variant="standard"
                                type="text"
                                value={currentScore || ""}
                                onChange={(e) =>
                                  handleScoreEdit(
                                    category.name,
                                    assignment,
                                    e.target.value
                                  )
                                }
                                onKeyPress={handleKeyPress}
                                onClick={handleInputClick}
                                sx={{
                                  width: "80px",
                                  "& input": {
                                    textAlign: "center",
                                  },
                                }}
                              />
                              {isEdited && (
                                <Tooltip title="Reset Score">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleResetScore(
                                        category.name,
                                        assignment
                                      )
                                    }
                                  >
                                    <RestoreIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
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
                        {whatIfMode && (
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                justifyContent: "center",
                              }}
                            >
                              <Tooltip
                                title={
                                  isHidden
                                    ? "Show Assignment"
                                    : "Hide Assignment"
                                }
                              >
                                <IconButton
                                  onClick={() =>
                                    onToggleAssignmentVisibility(
                                      category.name,
                                      assignment.name
                                    )
                                  }
                                  size="small"
                                >
                                  {isHidden ? (
                                    <VisibilityOffIcon />
                                  ) : (
                                    <VisibilityIcon />
                                  )}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Assignment">
                                <IconButton
                                  onClick={() =>
                                    handleDeleteClick(category.name, assignment)
                                  }
                                  size="small"
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Assignment</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {assignmentToDelete?.assignment?.name}
          ? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AssignmentTable;
