import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Container,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CategorySetup from "../components/CategorySetup";

const App = () => {
  // Step tracking
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    "Set Categories",
    "Input Grades",
    "Review & Categorize",
    "View Results",
  ];

  // Category management
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryWeight, setNewCategoryWeight] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [editingCategoryIndex, setEditingCategoryIndex] = useState(null); // Add this line

  // Grade data
  const [rawGradeData, setRawGradeData] = useState("");
  const [parsedGrades, setParsedGrades] = useState(null);
  const [uncategorizedAssignments, setUncategorizedAssignments] = useState([]);
  const [error, setError] = useState(null);

  // What-if mode state
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [targetGrade, setTargetGrade] = useState("");
  const [hypotheticalScores, setHypotheticalScores] = useState({});
  const [hypotheticalAssignments, setHypotheticalAssignments] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Handle grade data submission
  const handleProcessGrades = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/grades/calculate/raw",
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: rawGradeData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process grades");
      }

      const data = await response.json();
      setParsedGrades(data);
      setUncategorizedAssignments(data.assignments);
    } catch (err) {
      setError("Error processing grades: " + err.message);
    }
  };

  // Category Dialog
  const AddCategoryDialog = ({ open, onClose }) => {
    const [localName, setLocalName] = useState("");
    const [localWeight, setLocalWeight] = useState("");
    const [localError, setLocalError] = useState("");

    const handleClose = () => {
      setLocalName("");
      setLocalWeight("");
      setLocalError("");
      onClose();
    };

    const handleSubmit = () => {
      console.log("Attempting to add category:", { localName, localWeight }); // Debug log

      if (!localName || !localWeight) {
        setLocalError("Both name and weight are required");
        return;
      }

      const weight = parseFloat(localWeight);
      if (isNaN(weight) || weight <= 0 || weight > 100) {
        setLocalError("Weight must be between 0 and 100");
        return;
      }

      const totalWeight = categories.reduce(
        (sum, cat) => sum + cat.weight,
        weight
      );
      if (totalWeight > 100) {
        setLocalError("Total weights cannot exceed 100%");
        return;
      }

      const newCategory = {
        name: localName,
        weight: weight,
        assignments: [],
      };
      console.log("Adding new category:", newCategory); // Debug log
      setCategories((prevCategories) => [...prevCategories, newCategory]);
      handleClose();
    };

    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              fullWidth
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Weight (%)"
              type="number"
              fullWidth
              value={localWeight}
              onChange={(e) => setLocalWeight(e.target.value)}
              inputProps={{ min: "0", max: "100", step: "1" }}
            />
            {localError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {localError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    if (activeStep === 0 && categories.length === 0) {
      setError("Please add at least one category before proceeding");
      return;
    }

    if (activeStep === 1) {
      if (!rawGradeData.trim()) {
        setError("Please input your grade data before proceeding");
        return;
      }
      await handleProcessGrades();
    }

    if (activeStep === 2) {
      if (uncategorizedAssignments.length > 0) {
        setError("Please categorize all assignments before proceeding");
        return;
      }
      const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
      if (totalWeight !== 100) {
        setError("Total category weights must equal 100%");
        return;
      }
    }

    setActiveStep((prevStep) => prevStep + 1);
    setError(null);
  };

  const handleBack = () => {
    if (activeStep === 2) {
      const allAssignments = [
        ...uncategorizedAssignments,
        ...categories.flatMap((category) => category.assignments || []),
      ];

      const uniqueAssignments = Array.from(
        new Map(allAssignments.map((item) => [item.name, item])).values()
      );

      const newCategories = categories.map((category) => ({
        ...category,
        assignments: [],
      }));

      setCategories(newCategories);
      setUncategorizedAssignments(uniqueAssignments);
    }
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    let newUncategorized = [...uncategorizedAssignments];
    let newCategories = [...categories];

    newCategories = newCategories.map((category) => ({
      ...category,
      assignments: category.assignments || [],
    }));

    let draggedItem;

    if (sourceId === "uncategorized") {
      draggedItem = newUncategorized[source.index];
      newUncategorized.splice(source.index, 1);

      if (destId === "uncategorized") {
        newUncategorized.splice(destination.index, 0, draggedItem);
      } else if (destId.startsWith("category-")) {
        const categoryIndex = parseInt(destId.split("-")[1]);
        newCategories[categoryIndex].assignments.splice(
          destination.index,
          0,
          draggedItem
        );
      }
    } else if (sourceId.startsWith("category-")) {
      const sourceCategoryIndex = parseInt(sourceId.split("-")[1]);
      draggedItem =
        newCategories[sourceCategoryIndex].assignments[source.index];
      newCategories[sourceCategoryIndex].assignments.splice(source.index, 1);

      if (destId === "uncategorized") {
        newUncategorized.splice(destination.index, 0, draggedItem);
      } else if (destId.startsWith("category-")) {
        const destCategoryIndex = parseInt(destId.split("-")[1]);
        newCategories[destCategoryIndex].assignments.splice(
          destination.index,
          0,
          draggedItem
        );
      }
    }

    setUncategorizedAssignments(newUncategorized);
    setCategories(newCategories);
  };

  const calculateCategoryGrade = (assignments, categoryName) => {
    if (!assignments.length) return 0;

    // Get all assignments including hypothetical scores for upcoming assignments
    const allAssignments = assignments.map((assignment) => {
      if (assignment.status === "UPCOMING") {
        const hypotheticalScore =
          hypotheticalScores[`${categoryName}-${assignment.name}`];
        return hypotheticalScore || assignment;
      }
      return assignment;
    });

    const totalEarned = allAssignments.reduce((sum, a) => {
      // Use hypothetical score if it exists
      const score =
        a.status === "UPCOMING"
          ? hypotheticalScores[`${categoryName}-${assignment.name}`]?.score || 0
          : a.score;
      return sum + score;
    }, 0);

    const totalPossible = allAssignments.reduce(
      (sum, a) => sum + a.total_points,
      0
    );

    return totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
  };

  const calculateWeightedGrade = () => {
    return categories.reduce((total, category) => {
      const categoryHypotheticals = hypotheticalAssignments.filter(
        (a) => a.categoryName === category.name
      );

      // Combine real and hypothetical assignments
      const allAssignments = [
        ...category.assignments,
        ...categoryHypotheticals,
      ];

      const categoryGrade = calculateCategoryGrade(
        allAssignments,
        category.name
      );
      return total + categoryGrade * (category.weight / 100);
    }, 0);
  };

  const CategorySetup = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");

    const addEmptyCategory = () => {
      setCategories([...categories, { name: "", weight: "" }]);
    };

    const validateCategory = (category, index) => {
      if (!category.name || !category.weight) {
        return false;
      }

      const weight = parseFloat(category.weight);
      if (isNaN(weight) || weight <= 0 || weight > 100) {
        return false;
      }

      const totalWeight = categories.reduce(
        (sum, cat, i) =>
          i === index ? sum : sum + parseFloat(cat.weight || 0),
        weight
      );

      return totalWeight <= 100;
    };

    const handleCategoryChange = (index, field, value) => {
      const newCategories = [...categories];
      newCategories[index][field] = value;

      // Validate the updated category
      const isValid = validateCategory(newCategories[index], index);

      if (!isValid) {
        setError(
          "Please check category names and weights (0-100%). Total weight cannot exceed 100%."
        );
      } else {
        setError("");
      }

      setCategories(newCategories);
    };

    const handleDeleteCategory = (index) => {
      const newCategories = categories.filter((_, i) => i !== index);
      setCategories(newCategories);

      // Revalidate all categories after deletion
      const allValid = newCategories.every((cat, i) =>
        validateCategory(cat, i)
      );
      if (allValid) {
        setError("");
      }
    };

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h6">Grade Categories</Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={addEmptyCategory}
          >
            Add Category
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <List>
          {categories.map((category, index) => (
            <ListItem
              key={index}
              sx={{
                bgcolor: "background.paper",
                mb: 1,
                borderRadius: 1,
                border: "1px solid",
                borderColor: validateCategory(category, index)
                  ? "divider"
                  : "error.main",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <TextField
                  size="small"
                  label="Category Name"
                  value={category.name}
                  onChange={(e) =>
                    handleCategoryChange(index, "name", e.target.value)
                  }
                  sx={{ flexGrow: 1 }}
                  error={!category.name}
                />
                <TextField
                  size="small"
                  label="Weight"
                  type="number"
                  value={category.weight}
                  onChange={(e) =>
                    handleCategoryChange(index, "weight", e.target.value)
                  }
                  InputProps={{
                    endAdornment: "%",
                  }}
                  sx={{ width: "120px" }}
                  error={!validateCategory(category, index)}
                />
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteCategory(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
          <Typography color="text.secondary">
            Total Weight:{" "}
            {categories.reduce(
              (sum, cat) => sum + (parseFloat(cat.weight) || 0),
              0
            )}
            %
          </Typography>
        </Box>
      </Paper>
    );
  };

  const GradeInput = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Input Blackboard Grades
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Copy and paste your grades directly from Blackboard's grade center.
      </Alert>
      <TextField
        multiline
        fullWidth
        rows={10}
        value={rawGradeData}
        onChange={(e) => setRawGradeData(e.target.value)}
        placeholder="Paste your grades here..."
        variant="outlined"
      />
    </Paper>
  );

  const CategoryReview = () => {
    if (!parsedGrades || !uncategorizedAssignments) {
      return (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" color="error">
            No grade data available. Please go back and input your grades.
          </Typography>
        </Paper>
      );
    }

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Review and Categorize Assignments
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Drag and drop assignments into their appropriate categories. All
          assignments must be categorized before proceeding.
        </Alert>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {/* Categories section */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Categories
              </Typography>
              {categories.map((category, index) => (
                <Droppable
                  key={`category-${index}`}
                  droppableId={`category-${index}`}
                >
                  {(provided, snapshot) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        p: 2,
                        mb: 2,
                        minHeight: 100,
                        backgroundColor: snapshot.isDraggingOver
                          ? "action.hover"
                          : "background.paper",
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        {category.name} ({category.weight}%)
                      </Typography>
                      {(category.assignments || []).map(
                        (assignment, assignmentIndex) => (
                          <Draggable
                            key={`category-${index}-assignment-${assignmentIndex}`}
                            draggableId={`category-${index}-assignment-${assignmentIndex}`}
                            index={assignmentIndex}
                          >
                            {(provided, snapshot) => (
                              <Paper
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                elevation={snapshot.isDragging ? 6 : 1}
                                sx={{
                                  p: 1,
                                  mb: 1,
                                  backgroundColor: snapshot.isDragging
                                    ? "grey.100"
                                    : "background.paper",
                                  "&:hover": { backgroundColor: "grey.50" },
                                }}
                              >
                                <Typography variant="body2">
                                  {assignment.name} ({assignment.score}/
                                  {assignment.total_points})
                                </Typography>
                              </Paper>
                            )}
                          </Draggable>
                        )
                      )}
                      {provided.placeholder}
                    </Paper>
                  )}
                </Droppable>
              ))}
            </Box>

            {/* Uncategorized section */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Uncategorized Assignments ({uncategorizedAssignments.length})
              </Typography>
              <Droppable droppableId="uncategorized">
                {(provided, snapshot) => (
                  <Paper
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      p: 2,
                      minHeight: 100,
                      backgroundColor: snapshot.isDraggingOver
                        ? "action.hover"
                        : "background.paper",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    {uncategorizedAssignments.map((assignment, index) => (
                      <Draggable
                        key={`uncategorized-${index}`}
                        draggableId={`uncategorized-${index}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            elevation={snapshot.isDragging ? 6 : 1}
                            sx={{
                              p: 1,
                              mb: 1,
                              backgroundColor: snapshot.isDragging
                                ? "grey.100"
                                : "background.paper",
                              "&:hover": { backgroundColor: "grey.50" },
                            }}
                          >
                            <Typography variant="body2">
                              {assignment.name} ({assignment.score}/
                              {assignment.total_points})
                            </Typography>
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Paper>
                )}
              </Droppable>
            </Box>
          </Box>
        </DragDropContext>
      </Paper>
    );
  };

  const Results = ({
    categories,
    parsedGrades,
    whatIfMode,
    setWhatIfMode,
    targetGrade,
    setTargetGrade,
    hypotheticalScores,
    setHypotheticalScores,
    hypotheticalAssignments,
    setHypotheticalAssignments,
    dialogOpen,
    setDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    selectedAssignment,
    setSelectedAssignment,
    selectedCategory,
    setSelectedCategory,
  }) => {
    console.log("Results component rendering with:", {
      parsedGrades,
      categories,
      whatIfMode,
      hypotheticalScores,
      hypotheticalAssignments,
    });

    const calculateCategoryGrade = (assignments, categoryName) => {
      if (!assignments.length) return 0;

      // Get all assignments including hypothetical scores for upcoming assignments
      const allAssignments = assignments.map((assignment) => {
        if (assignment.status === "UPCOMING") {
          const hypotheticalScore =
            hypotheticalScores[`${categoryName}-${assignment.name}`];
          return hypotheticalScore || assignment;
        }
        return assignment;
      });

      const totalEarned = allAssignments.reduce((sum, a) => {
        const score =
          a.status === "UPCOMING"
            ? hypotheticalScores[`${categoryName}-${a.name}`]?.score || 0
            : a.score;
        return sum + score;
      }, 0);

      const totalPossible = allAssignments.reduce(
        (sum, a) => sum + a.total_points,
        0
      );

      return totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
    };

    const calculateWeightedGrade = () => {
      return categories.reduce((total, category) => {
        const categoryHypotheticals = hypotheticalAssignments.filter(
          (a) => a.categoryName === category.name
        );

        // Combine real and hypothetical assignments
        const allAssignments = [
          ...category.assignments,
          ...categoryHypotheticals,
        ];

        const categoryGrade = calculateCategoryGrade(
          allAssignments,
          category.name
        );
        return total + categoryGrade * (category.weight / 100);
      }, 0);
    };

    // Check for missing data
    if (!parsedGrades) {
      console.log("Missing parsedGrades");
    }
    if (!categories || categories.length === 0) {
      console.log("Missing or empty categories");
    }

    if (!parsedGrades || !categories || categories.length === 0) {
      return (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" color="error">
            No grade data available. Please go back and enter your grades.
          </Typography>
        </Paper>
      );
    }

    // Count upcoming assignments per category
    const upcomingByCategory = categories.reduce((acc, category) => {
      acc[category.name] = category.assignments.filter(
        (a) => a.status === "UPCOMING"
      ).length;
      return acc;
    }, {});

    const weightedGrade = calculateWeightedGrade();

    return (
      <Box>
        {/* Current Grade Summary */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" color="primary">
              Current Grade: {weightedGrade.toFixed(2)}%
            </Typography>
            <Button
              variant="contained"
              color={whatIfMode ? "secondary" : "primary"}
              onClick={() => setWhatIfMode(!whatIfMode)}
            >
              {whatIfMode ? "Exit What-If Mode" : "Enter What-If Mode"}
            </Button>
          </Box>

          {whatIfMode && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                What-If Analysis
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  label="Target Grade"
                  type="number"
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  InputProps={{
                    endAdornment: "%",
                  }}
                  sx={{ width: 150 }}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    // Calculate needed scores logic here
                  }}
                >
                  Calculate Needed Scores
                </Button>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Category Breakdown */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Grade Breakdown by Category
          </Typography>
          {categories.map((category, index) => {
            // Get hypothetical assignments for this category
            const categoryHypotheticals = hypotheticalAssignments.filter(
              (a) => a.categoryName === category.name
            );

            // Combine real and hypothetical assignments for calculations
            const allAssignments = [
              ...category.assignments,
              ...categoryHypotheticals,
            ];

            const categoryGrade = calculateCategoryGrade(allAssignments);
            const weightedContribution =
              categoryGrade * (category.weight / 100);
            const hasUpcoming = upcomingByCategory[category.name] > 0;

            return (
              <Paper
                key={index}
                sx={{ p: 2, mb: 2, backgroundColor: "grey.50" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="subtitle1">
                    {category.name} (Weight: {category.weight}%)
                  </Typography>
                  {whatIfMode && (
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setSelectedCategory(category.name);
                        setDialogOpen(true);
                      }}
                    >
                      Add Hypothetical Assignment
                    </Button>
                  )}
                </Box>
                <Box sx={{ pl: 2 }}>
                  <Typography>
                    Raw Grade: {categoryGrade.toFixed(2)}%
                  </Typography>
                  <Typography>
                    Weighted Contribution: {weightedContribution.toFixed(2)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {allAssignments.length} assignments
                    {hasUpcoming &&
                      ` (${upcomingByCategory[category.name]} upcoming)`}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Paper>

        {/* Add the dialogs */}
        <HypotheticalAssignmentDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedCategory(null);
          }}
          onAdd={(newAssignment) => {
            setHypotheticalAssignments([
              ...hypotheticalAssignments,
              newAssignment,
            ]);
            setDialogOpen(false);
            setSelectedCategory(null);
          }}
          categoryName={selectedCategory}
        />

        <EditScoreDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedAssignment(null);
            setSelectedCategory(null);
          }}
          onSave={(updatedAssignment) => {
            const newScores = { ...hypotheticalScores };
            const key = `${updatedAssignment.categoryName}-${updatedAssignment.name}`;
            newScores[key] = updatedAssignment;
            setHypotheticalScores(newScores);
            setEditDialogOpen(false);
            setSelectedAssignment(null);
            setSelectedCategory(null);
          }}
          assignment={selectedAssignment}
          categoryName={selectedCategory}
        />

        {/* Detailed Assignment Breakdown */}
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
                      {whatIfMode && (
                        <TableCell align="right">Actions</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      ...category.assignments,
                      ...hypotheticalAssignments
                        .filter((a) => a.categoryName === category.name)
                        .map((a) => ({ ...a, isHypothetical: true })),
                    ].map((assignment, assignmentIndex) => (
                      <TableRow
                        key={assignmentIndex}
                        sx={{
                          backgroundColor: assignment.isHypothetical
                            ? "action.hover"
                            : assignment.status === "UPCOMING"
                            ? hypotheticalScores[
                                `${category.name}-${assignment.name}`
                              ]
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
                        <TableCell align="right">
                          {assignment.status === "UPCOMING"
                            ? hypotheticalScores[
                                `${category.name}-${assignment.name}`
                              ]?.score || "-"
                            : assignment.score}
                        </TableCell>
                        <TableCell align="right">
                          {assignment.total_points}
                        </TableCell>
                        <TableCell align="right">
                          {assignment.status === "UPCOMING"
                            ? hypotheticalScores[
                                `${category.name}-${assignment.name}`
                              ]
                              ? (
                                  (hypotheticalScores[
                                    `${category.name}-${assignment.name}`
                                  ].score /
                                    assignment.total_points) *
                                  100
                                ).toFixed(1) + "%"
                              : "-"
                            : (
                                (assignment.score / assignment.total_points) *
                                100
                              ).toFixed(1) + "%"}
                        </TableCell>
                        {whatIfMode && (
                          <TableCell align="right">
                            {(assignment.status === "UPCOMING" ||
                              assignment.isHypothetical) && (
                              <Button
                                size="small"
                                onClick={() => {
                                  setSelectedCategory(category.name);
                                  setSelectedAssignment(assignment);
                                  setEditDialogOpen(true);
                                }}
                              >
                                {hypotheticalScores[
                                  `${category.name}-${assignment.name}`
                                ] || assignment.isHypothetical
                                  ? "Edit Score"
                                  : "Add Score"}
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Paper>
      </Box>
    );
  };

  // Main render
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Grade Calculator
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <CategorySetup
            categories={categories}
            setCategories={setCategories}
            error={error}
            setError={setError}
          />
        )}
        {activeStep === 1 && <GradeInput />}
        {activeStep === 2 && <CategoryReview />}
        {activeStep === 3 && (
          <Results
            categories={categories}
            parsedGrades={parsedGrades}
            whatIfMode={whatIfMode}
            setWhatIfMode={setWhatIfMode}
            targetGrade={targetGrade}
            setTargetGrade={setTargetGrade}
            hypotheticalScores={hypotheticalScores}
            setHypotheticalScores={setHypotheticalScores}
            hypotheticalAssignments={hypotheticalAssignments}
            setHypotheticalAssignments={setHypotheticalAssignments}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            editDialogOpen={editDialogOpen}
            setEditDialogOpen={setEditDialogOpen}
            selectedAssignment={selectedAssignment}
            setSelectedAssignment={setSelectedAssignment}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button variant="contained" color="success">
              Finish
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default App;
