import React, { useRef, useState, useEffect } from "react";
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
  Collapse,
  useTheme,
  Divider,
  Switch,
} from "@mui/material";
import {
  BarChart2,
  Eye,
  EyeOff,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  TimerReset,
  AlertTriangle,
  Clock,
  Award,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const theme = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [editedScores, setEditedScores] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetAssignment, setResetAssignment] = useState(null);

  // Initialize with all categories expanded
  useEffect(() => {
    const initialExpanded = {};
    categories.forEach((category, index) => {
      initialExpanded[index] = true;
    });
    setExpandedCategories(initialExpanded);
  }, [categories]);

  const toggleCategory = (index) => {
    setExpandedCategories({
      ...expandedCategories,
      [index]: !expandedCategories[index],
    });
  };

  const handleScoreEdit = (categoryName, assignment, newValue) => {
    // Only allow digits and at most one decimal point
    if (newValue !== '' && !/^\d*\.?\d*$/.test(newValue)) {
      console.log("Invalid input rejected:", newValue);
      return; // Reject non-numeric input
    }
    
    // Don't allow negative numbers
    if (parseFloat(newValue) < 0) {
      console.log("Negative value rejected:", newValue);
      return;
    }
    
    console.log("Valid score input:", newValue);
    
    // Store validated input in state
    const scoreKey = `${categoryName}-${assignment.name}`;
    setEditedScores((prev) => ({
      ...prev,
      [scoreKey]: true,
    }));

    setHypotheticalScores((prev) => ({
      ...prev,
      [scoreKey]: {
        ...assignment,
        score: newValue,  // Store raw input
        displayScore: newValue, // For display
        numericScore: parseFloat(newValue) || 0, // For calculations
        categoryName,
        isHypothetical: true,
      },
    }));
  };

  // New handler for when input loses focus to properly validate
  const handleScoreBlur = (categoryName, assignment) => {
    const scoreKey = `${categoryName}-${assignment.name}`;
    const hypotheticalData = hypotheticalScores[scoreKey];
    
    if (!hypotheticalData) return;
    
    // Get the current value
    let inputValue = hypotheticalData.score;
    
    // Clean and validate the input
    if (inputValue === '' || inputValue === null || inputValue === undefined) {
      // If empty, set to 0 instead of original score
      inputValue = "0";
      console.log(`Empty input, setting to zero: ${inputValue}`);
    } else if (isNaN(parseFloat(inputValue)) || parseFloat(inputValue) < 0) {
      // If invalid or negative, set to 0
      inputValue = "0";
      console.log(`Invalid input, setting to zero: ${inputValue}`);
    } else {
      // Ensure proper formatting for valid numbers
      const numValue = parseFloat(inputValue);
      // If it's a whole number, remove decimal part
      if (Math.floor(numValue) === numValue) {
        inputValue = Math.floor(numValue).toString();
      }
    }
    
    // Update with validated value
    setHypotheticalScores((prev) => ({
      ...prev,
      [scoreKey]: {
        ...prev[scoreKey],
        score: inputValue,
        displayScore: inputValue,
        numericScore: parseFloat(inputValue) || 0,
      },
    }));
    
    console.log(`Score finalized on blur: ${inputValue}`);
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
    setResetAssignment({
      categoryName,
      assignment,
    });
    setResetDialogOpen(true);
  };

  const confirmReset = () => {
    const { categoryName, assignment } = resetAssignment;
    const scoreKey = `${categoryName}-${assignment.name}`;
    
    // Reset to the original assignment score
    setHypotheticalScores((prev) => ({
      ...prev,
      [scoreKey]: {
        ...assignment,
        score: assignment.score || "0",
        displayScore: assignment.score || "0",
        numericScore: Number(assignment.score) || 0,
        categoryName,
        isHypothetical: true,
      },
    }));

    const newEditedScores = { ...editedScores };
    delete newEditedScores[scoreKey];
    setEditedScores(newEditedScores);

    setResetDialogOpen(false);
    setResetAssignment(null);
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
    if (isHypothetical) return theme.palette.info.main;
    if (status === "UPCOMING") return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getStatusIcon = (status, isHypothetical) => {
    if (isHypothetical) return <AlertTriangle size={14} />;
    if (status === "UPCOMING") return <Clock size={14} />;
    return <CheckCircle size={14} />;
  };

  const isDark = theme.palette.mode === "dark";

  return (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        borderRadius: "20px",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "background.default",
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "alpha(theme.palette.primary.main, 0.03)",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />

      <Stack spacing={4} sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              backgroundColor: isDark 
                ? "transparent" 
                : alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.palette.primary.main,
              border: isDark
                ? `1px solid ${alpha(theme.palette.primary.main, 0.5)}`
                : "none",
            }}
          >
            <BarChart2 size={24} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Detailed Assignment Breakdown
          </Typography>
        </Box>

        {categories.map((category, categoryIndex) => (
          <Paper
            key={categoryIndex}
            elevation={1}
            sx={{
              borderRadius: "16px",
              overflow: "hidden",
              transition: "box-shadow 0.3s ease",
              "&:hover": {
                boxShadow: theme.shadows[3],
              },
            }}
          >
            <Box
              sx={{
                p: 2.5,
                backgroundColor: isDark 
                  ? 'transparent'
                  : alpha(theme.palette.primary.main, 0.04),
                borderBottom: isDark
                  ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  : 'none',
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
              onClick={() => toggleCategory(categoryIndex)}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    backgroundColor: isDark 
                      ? "transparent"
                      : alpha(theme.palette.primary.main, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.palette.primary.main,
                    border: isDark
                      ? `1px solid ${alpha(theme.palette.primary.main, 0.5)}`
                      : "none",
                  }}
                >
                  <Award size={20} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {
                      [
                        ...category.assignments,
                        ...hypotheticalAssignments.filter(
                          (a) => a.categoryName === category.name
                        ),
                      ].length
                    }{" "}
                    assignments
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Chip
                  label={`${category.weight}%`}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: isDark 
                      ? "transparent" 
                      : alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    border: isDark
                      ? `1px solid ${alpha(theme.palette.primary.main, 0.5)}`
                      : "none",
                  }}
                />
                <IconButton size="small">
                  {expandedCategories[categoryIndex] ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </IconButton>
              </Box>
            </Box>

            <Collapse in={expandedCategories[categoryIndex]}>
              <AnimatePresence>
                {expandedCategories[categoryIndex] && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TableContainer sx={{ maxHeight: 600 }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                fontWeight: 600,
                                backgroundColor: theme.palette.background.paper,
                                color: theme.palette.text.primary,
                                borderBottom: `2px solid ${theme.palette.divider}`,
                              }}
                            >
                              Assignment
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                fontWeight: 600,
                                backgroundColor: theme.palette.background.paper,
                                color: theme.palette.text.primary,
                                borderBottom: `2px solid ${theme.palette.divider}`,
                              }}
                            >
                              Status
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                fontWeight: 600,
                                backgroundColor: theme.palette.background.paper,
                                color: theme.palette.text.primary,
                                borderBottom: `2px solid ${theme.palette.divider}`,
                              }}
                            >
                              Score
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                fontWeight: 600,
                                backgroundColor: theme.palette.background.paper,
                                color: theme.palette.text.primary,
                                borderBottom: `2px solid ${theme.palette.divider}`,
                              }}
                            >
                              Total Points
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                fontWeight: 600,
                                backgroundColor: theme.palette.background.paper,
                                color: theme.palette.text.primary,
                                borderBottom: `2px solid ${theme.palette.divider}`,
                              }}
                            >
                              Percentage
                            </TableCell>
                            {whatIfMode && (
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: 600,
                                  backgroundColor:
                                    theme.palette.background.paper,
                                  color: theme.palette.text.primary,
                                  borderBottom: `2px solid ${theme.palette.divider}`,
                                }}
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
                            const hypotheticalData =
                              hypotheticalScores[scoreKey];
                            const isEdited = editedScores[scoreKey];
                            const currentScore = hypotheticalData
                              ? (hypotheticalData.displayScore || hypotheticalData.score || "0")
                              : (assignment.score || "0");
                            const scoreForCalculations = hypotheticalData
                              ? (hypotheticalData.numericScore || Number(hypotheticalData.score) || 0)
                              : (Number(assignment.score) || 0);
                            const percentage =
                              (scoreForCalculations / assignment.total_points) * 100;
                            const isHidden =
                              hiddenAssignments.includes(scoreKey);

                            const getPercentageColor = (percentage) => {
                              if (isNaN(percentage))
                                return theme.palette.text.secondary;
                              if (percentage >= 90)
                                return theme.palette.success.main;
                              if (percentage >= 80)
                                return theme.palette.primary.main;
                              if (percentage >= 70)
                                return theme.palette.warning.main;
                              return theme.palette.error.main;
                            };

                            return (
                              <TableRow
                                key={`${category.name}-${assignment.name}-${assignmentIndex}`}
                                sx={{
                                  bgcolor: isHidden
                                    ? alpha("#9e9e9e", 0.08)
                                    : isEdited
                                    ? alpha(theme.palette.info.main, 0.05)
                                    : "inherit",
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.04
                                    ),
                                  },
                                  opacity: isHidden ? 0.6 : 1,
                                  transition: "all 0.2s ease",
                                  borderBottom: `1px solid ${theme.palette.divider}`,
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
                                      sx={{
                                        fontWeight: 500,
                                        textDecoration: isHidden
                                          ? "line-through"
                                          : "none",
                                      }}
                                    >
                                      {assignment.name}
                                    </Typography>
                                    {assignment.isHypothetical && (
                                      <Chip
                                        size="small"
                                        label="Hypothetical"
                                        color="info"
                                        variant="outlined"
                                        sx={{ height: 22, fontSize: "0.7rem" }}
                                      />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    size="small"
                                    label={assignment.status}
                                    icon={getStatusIcon(
                                      assignment.status,
                                      assignment.isHypothetical
                                    )}
                                    sx={{
                                      backgroundColor: alpha(
                                        getStatusColor(
                                          assignment.status,
                                          assignment.isHypothetical
                                        ),
                                        0.1
                                      ),
                                      color: getStatusColor(
                                        assignment.status,
                                        assignment.isHypothetical
                                      ),
                                      fontWeight: 500,
                                      height: 24,
                                      "& .MuiChip-icon": {
                                        color: "inherit",
                                      },
                                    }}
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
                                        variant="outlined"
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0"
                                        size="small"
                                        value={currentScore || ""}
                                        onChange={(e) =>
                                          handleScoreEdit(
                                            category.name,
                                            assignment,
                                            e.target.value
                                          )
                                        }
                                        onBlur={() => 
                                          handleScoreBlur(
                                            category.name,
                                            assignment
                                          )
                                        }
                                        onKeyPress={handleKeyPress}
                                        onClick={handleInputClick}
                                        sx={{
                                          width: "80px",
                                          "& input": {
                                            textAlign: "center",
                                          },
                                          "& .MuiOutlinedInput-root": {
                                            borderRadius: "10px",
                                            backgroundColor: "white",
                                            ...(isEdited && {
                                              borderColor:
                                                theme.palette.info.main,
                                              boxShadow: `0 0 0 2px ${alpha(
                                                theme.palette.info.main,
                                                0.2
                                              )}`,
                                            }),
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
                                            sx={{
                                              color: theme.palette.primary.main,
                                              backgroundColor: alpha(
                                                theme.palette.primary.main,
                                                0.1
                                              ),
                                              "&:hover": {
                                                backgroundColor: alpha(
                                                  theme.palette.primary.main,
                                                  0.2
                                                ),
                                              },
                                            }}
                                          >
                                            <RotateCcw size={16} />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                    </Box>
                                  ) : (
                                    <Typography fontWeight={500}>
                                      {currentScore}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  <Typography fontWeight={500}>
                                    {assignment.total_points}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color: getPercentageColor(percentage),
                                      backgroundColor: alpha(
                                        getPercentageColor(percentage),
                                        0.1
                                      ),
                                      borderRadius: "8px",
                                      px: 1.5,
                                      py: 0.5,
                                      display: "inline-block",
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
                                          sx={{
                                            backgroundColor: alpha(
                                              isHidden
                                                ? theme.palette.warning.main
                                                : theme.palette.primary.main,
                                              0.1
                                            ),
                                            color: isHidden
                                              ? theme.palette.warning.main
                                              : theme.palette.primary.main,
                                            "&:hover": {
                                              backgroundColor: alpha(
                                                isHidden
                                                  ? theme.palette.warning.main
                                                  : theme.palette.primary.main,
                                                0.2
                                              ),
                                            },
                                          }}
                                        >
                                          {isHidden ? (
                                            <EyeOff size={18} />
                                          ) : (
                                            <Eye size={18} />
                                          )}
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Delete Assignment">
                                        <IconButton
                                          onClick={() =>
                                            handleDeleteClick(
                                              category.name,
                                              assignment
                                            )
                                          }
                                          size="small"
                                          sx={{
                                            backgroundColor: alpha(
                                              theme.palette.error.main,
                                              0.1
                                            ),
                                            color: theme.palette.error.main,
                                            "&:hover": {
                                              backgroundColor: alpha(
                                                theme.palette.error.main,
                                                0.2
                                              ),
                                            },
                                          }}
                                        >
                                          <Trash2 size={18} />
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
                  </motion.div>
                )}
              </AnimatePresence>
            </Collapse>
          </Paper>
        ))}
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: theme.shadows[5],
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Assignment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <Box component="span" sx={{ fontWeight: 600 }}>
              {assignmentToDelete?.assignment?.name}
            </Box>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ borderRadius: "10px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            startIcon={<Trash2 size={16} />}
            sx={{
              borderRadius: "10px",
              boxShadow: `0 4px 10px ${alpha(theme.palette.error.main, 0.2)}`,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Score Confirmation Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: theme.shadows[5],
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <TimerReset size={20} color={theme.palette.warning.main} />
            Reset Score
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset the score for{" "}
            <Box component="span" sx={{ fontWeight: 600 }}>
              {resetAssignment?.assignment?.name}
            </Box>
            ? This will revert to the original score.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            onClick={() => setResetDialogOpen(false)}
            sx={{ borderRadius: "10px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmReset}
            color="warning"
            variant="contained"
            startIcon={<RotateCcw size={16} />}
            sx={{
              borderRadius: "10px",
              boxShadow: `0 4px 10px ${alpha(theme.palette.warning.main, 0.2)}`,
            }}
          >
            Reset Score
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AssignmentTable;
