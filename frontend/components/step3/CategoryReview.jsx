import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Paper,
  Typography,
  Alert,
  Box,
  Stack,
  alpha,
  Collapse,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CategoryIcon from "@mui/icons-material/Category";
import AssignmentIcon from "@mui/icons-material/Assignment";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupWorkIcon from "@mui/icons-material/GroupWork";

const CategoryReview = ({
  parsedGrades,
  uncategorizedAssignments,
  categories,
  handleDragEnd,
  setUncategorizedAssignments,
  setCategories,
}) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [autoCategorizationApplied, setAutoCategorizationApplied] =
    useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [selectedCategoryForBulk, setSelectedCategoryForBulk] = useState("");

  const toggleCategory = (categoryIndex) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryIndex]: !prev[categoryIndex],
    }));
  };

  const handleDeleteAssignment = (assignment) => {
    // Remove from uncategorized if present
    if (uncategorizedAssignments.find((a) => a.name === assignment.name)) {
      setUncategorizedAssignments(
        uncategorizedAssignments.filter((a) => a.name !== assignment.name)
      );
      return;
    }

    // Remove from categories if present
    const newCategories = categories.map((category) => ({
      ...category,
      assignments: (category.assignments || []).filter(
        (a) => a.name !== assignment.name
      ),
    }));
    setCategories(newCategories);
  };

  const applyAutoCategories = () => {
    // Create a copy of current state
    let newUncategorized = [...uncategorizedAssignments];
    let newCategories = categories.map((category) => ({
      ...category,
      assignments: [...(category.assignments || [])],
    }));

    // Process each uncategorized assignment
    uncategorizedAssignments.forEach((assignment) => {
      if (assignment.suggested_category) {
        // Find the matching category
        const categoryIndex = newCategories.findIndex(
          (cat) =>
            cat.name.toLowerCase() ===
            assignment.suggested_category.toLowerCase()
        );

        if (categoryIndex !== -1) {
          // Add to appropriate category
          newCategories[categoryIndex].assignments = [
            ...(newCategories[categoryIndex].assignments || []),
            assignment,
          ];
          // Remove from uncategorized
          newUncategorized = newUncategorized.filter(
            (a) => a.name !== assignment.name
          );
        }
      }
    });

    // Update state
    setCategories(newCategories);
    setUncategorizedAssignments(newUncategorized);
    setAutoCategorizationApplied(true);
  };

  const openBulkCategorizeDialog = () => {
    setSelectedAssignments([]);
    setSelectedCategoryForBulk("");
    setBulkDialogOpen(true);
  };

  const handleBulkCategorize = () => {
    if (!selectedCategoryForBulk || selectedAssignments.length === 0) {
      return;
    }

    // Find the category index
    const categoryIndex = categories.findIndex(
      (cat) => cat.name === selectedCategoryForBulk
    );

    if (categoryIndex === -1) {
      return;
    }

    // Create new state
    let newUncategorized = [...uncategorizedAssignments];
    let newCategories = [...categories];

    // Move selected assignments to the category
    const assignmentsToMove = newUncategorized.filter((assignment) =>
      selectedAssignments.includes(assignment.name)
    );

    // Add assignments to the selected category
    newCategories[categoryIndex] = {
      ...newCategories[categoryIndex],
      assignments: [
        ...(newCategories[categoryIndex].assignments || []),
        ...assignmentsToMove,
      ],
    };

    // Remove from uncategorized
    newUncategorized = newUncategorized.filter(
      (assignment) => !selectedAssignments.includes(assignment.name)
    );

    // Update state
    setCategories(newCategories);
    setUncategorizedAssignments(newUncategorized);
    setBulkDialogOpen(false);
  };

  if (!parsedGrades || !uncategorizedAssignments) {
    return (
      <Paper elevation={2} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" color="error">
          No grade data available. Please go back and input your grades.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
      <Stack spacing={3}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CategoryIcon
              sx={{ fontSize: 32, color: "primary.main", opacity: 0.8 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 500 }}>
              Review and Categorize Assignments
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            {uncategorizedAssignments.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<GroupWorkIcon />}
                  onClick={openBulkCategorizeDialog}
                  sx={{ px: 3, py: 1 }}
                >
                  Bulk Categorize
                </Button>
                {!autoCategorizationApplied && (
                  <Button
                    variant="contained"
                    startIcon={<AutoFixHighIcon />}
                    onClick={applyAutoCategories}
                    sx={{ px: 3, py: 1 }}
                  >
                    Auto-Categorize
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>

        <Alert
          severity="info"
          sx={{
            backgroundColor: alpha("#2196f3", 0.08),
            border: "1px solid",
            borderColor: alpha("#2196f3", 0.2),
            "& .MuiAlert-icon": { color: "primary.main" },
          }}
        >
          {autoCategorizationApplied
            ? "Assignments have been automatically categorized. You can still drag and drop to make adjustments or use Bulk Categorize for multiple assignments."
            : "Click 'Auto-Categorize' to automatically sort assignments, use 'Bulk Categorize' to categorize multiple assignments at once, or manually drag and drop them into categories."}
        </Alert>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            {/* Categories section */}
            <Stack spacing={2}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AssignmentIcon />
                Categories
              </Typography>

              {categories.map((category, index) => (
                <Droppable
                  droppableId={`category-${index}`}
                  type="assignment"
                  key={`category-${index}`}
                >
                  {(provided, snapshot) => (
                    <Paper
                      elevation={1}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: snapshot.isDraggingOver
                          ? "primary.main"
                          : "divider",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          bgcolor: expandedCategories[index]
                            ? alpha("#2196f3", 0.08)
                            : "background.paper",
                          "&:hover": {
                            bgcolor: alpha("#2196f3", 0.04),
                          },
                        }}
                        onClick={() => toggleCategory(index)}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 500 }}
                          >
                            {category.name} ({category.weight}%)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {category.assignments?.length || 0} assignments
                          </Typography>
                        </Box>
                        <IconButton size="small">
                          {expandedCategories[index] ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </Box>

                      <Collapse in={expandedCategories[index]}>
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: snapshot.isDraggingOver
                              ? alpha("#2196f3", 0.08)
                              : "background.paper",
                            minHeight: "8px",
                          }}
                        >
                          <Stack spacing={1}>
                            {(category.assignments || []).map(
                              (assignment, assignmentIndex) => (
                                <AssignmentItem
                                  key={`${category.name}-${assignment.name}-${assignmentIndex}`}
                                  assignment={assignment}
                                  index={assignmentIndex}
                                  parentId={`${category.name}-${assignment.name}-${assignmentIndex}`}
                                  onDelete={handleDeleteAssignment}
                                />
                              )
                            )}
                          </Stack>
                        </Box>
                      </Collapse>
                      {provided.placeholder}
                    </Paper>
                  )}
                </Droppable>
              ))}
            </Stack>

            {/* Uncategorized section */}
            <Stack spacing={2}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AssignmentIcon />
                Uncategorized Assignments ({uncategorizedAssignments.length})
              </Typography>

              <Droppable droppableId="uncategorized" type="assignment">
                {(provided, snapshot) => (
                  <Paper
                    elevation={1}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: snapshot.isDraggingOver
                        ? "warning.main"
                        : "divider",
                      bgcolor: snapshot.isDraggingOver
                        ? alpha("#ff9800", 0.08)
                        : "background.paper",
                    }}
                  >
                    <Stack spacing={1}>
                      {uncategorizedAssignments.map((assignment, index) => (
                        <AssignmentItem
                          key={`uncategorized-${assignment.name}-${index}`}
                          assignment={assignment}
                          index={index}
                          parentId={`uncategorized-${assignment.name}-${index}`}
                          onDelete={handleDeleteAssignment}
                        />
                      ))}
                      {provided.placeholder}
                    </Stack>
                  </Paper>
                )}
              </Droppable>
            </Stack>
          </Box>
        </DragDropContext>
      </Stack>

      {/* Bulk Categorization Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Categorize Assignments</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="assignment-select-label">Select Assignments</InputLabel>
              <Select
                labelId="assignment-select-label"
                multiple
                value={selectedAssignments}
                onChange={(e) => setSelectedAssignments(e.target.value)}
                renderValue={(selected) => 
                  selected.length === 1 
                    ? selected[0] 
                    : `${selected.length} assignments selected`
                }
              >
                {uncategorizedAssignments.map((assignment) => (
                  <MenuItem key={assignment.name} value={assignment.name}>
                    <Checkbox checked={selectedAssignments.includes(assignment.name)} />
                    <ListItemText 
                      primary={assignment.name} 
                      secondary={
                        assignment.suggested_category
                          ? `Suggested: ${assignment.suggested_category}`
                          : "No suggestion"
                      }
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="category-select-label">Select Category</InputLabel>
              <Select
                labelId="category-select-label"
                value={selectedCategoryForBulk}
                onChange={(e) => setSelectedCategoryForBulk(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category.name} value={category.name}>
                    {category.name} ({category.weight}%)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkCategorize} 
            variant="contained" 
            disabled={!selectedCategoryForBulk || selectedAssignments.length === 0}
          >
            Categorize
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

// Helper component for assignment items
const AssignmentItem = ({ assignment, index, parentId, onDelete }) => (
  <Draggable draggableId={parentId} index={index}>
    {(provided, snapshot) => (
      <Paper
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        elevation={snapshot.isDragging ? 3 : 1}
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: snapshot.isDragging
            ? alpha("#2196f3", 0.08)
            : "background.paper",
          border: "1px solid",
          borderColor: snapshot.isDragging ? "primary.main" : "divider",
          display: "flex",
          alignItems: "center",
          gap: 1,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: 2,
          },
        }}
      >
        <DragIndicatorIcon sx={{ color: "text.secondary" }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {assignment.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Score: {assignment.score}/{assignment.total_points}
            {assignment.suggested_category &&
              ` • Suggested: ${assignment.suggested_category}`}
          </Typography>
        </Box>
        <IconButton
          onClick={() => onDelete(assignment)}
          sx={{
            color: "error.main",
            "&:hover": {
              backgroundColor: alpha("#f44336", 0.08),
            },
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Paper>
    )}
  </Draggable>
);

export default CategoryReview;
