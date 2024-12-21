import React, { useState } from "react";
import {
  Container,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Typography,
  Alert,
} from "@mui/material";

import CategorySetup from "./components/CategorySetup";
import GradeInput from "./components/GradeInput";
import CategoryReview from "./components/CategoryReview";
import Results from "./components/Results";

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
  const [error, setError] = useState(null);

  // Grade data
  const [rawGradeData, setRawGradeData] = useState("");
  const [parsedGrades, setParsedGrades] = useState(null);
  const [uncategorizedAssignments, setUncategorizedAssignments] = useState([]);

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

  const handleNext = async () => {
    if (activeStep === 0) {
      const totalWeight = categories.reduce(
        (sum, cat) => sum + parseFloat(cat.weight || 0),
        0
      );
      const allCategoriesValid =
        categories.length > 0 &&
        categories.every((cat) => cat.name && cat.weight) &&
        totalWeight === 100;

      if (!allCategoriesValid) {
        setError(
          "Please complete all category information and ensure total weight equals 100%"
        );
        return;
      }
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

        {activeStep === 1 && (
          <GradeInput
            rawGradeData={rawGradeData}
            setRawGradeData={setRawGradeData}
          />
        )}

        {activeStep === 2 && (
          <CategoryReview
            parsedGrades={parsedGrades}
            uncategorizedAssignments={uncategorizedAssignments}
            categories={categories}
            handleDragEnd={handleDragEnd}
          />
        )}

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
            calculateCategoryGrade={calculateCategoryGrade}
            calculateWeightedGrade={calculateWeightedGrade}
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
