import React, { useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  Paper,
  Container,
  useTheme,
} from "@mui/material";

import GradeInput from "../components/GradeInput";
import CategoryReview from "../components/CategoryReview";
import CategorySetup from "../components/CategorySetup";
import LoadingOverlay from "../components/LoadingOverlay";
import Results from "../components/results/Results";

const App = () => {
  const theme = useTheme();
  // Step tracking
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    "Set Categories",
    "Input Grades",
    "Review & Categorize",
    "View Results",
  ];

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Category management
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  // Grade data
  const [mode, setMode] = useState("manual");
  const [rawGradeData, setRawGradeData] = useState("");
  const [parsedGrades, setParsedGrades] = useState(null);
  const [uncategorizedAssignments, setUncategorizedAssignments] = useState([]);
  const [manualGrades, setManualGrades] = useState([]);

  // What-if analysis states
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [targetGrade, setTargetGrade] = useState("");
  const [hypotheticalScores, setHypotheticalScores] = useState({});
  const [hypotheticalAssignments, setHypotheticalAssignments] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleProcessGrades = async () => {
    try {
      setIsLoading(true);
      const minRequiredLines = 4;
      const lines = rawGradeData
        .split("\n")
        .filter((line) => line.trim().length > 0);

      if (lines.length < minRequiredLines) {
        setError(
          "Invalid grade data format. Please paste complete grade information from Blackboard."
        );
        return false;
      }

      const headers = {
        "Content-Type": "text/plain",
      };

      if (categories && categories.length > 0) {
        headers["X-Grade-Categories"] = JSON.stringify(
          categories.map((cat) => cat.name)
        );
      }

      const response = await fetch(
        "http://localhost:8000/api/grades/calculate/raw",
        {
          method: "POST",
          headers: headers,
          body: rawGradeData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process grades");
      }

      const data = await response.json();

      if (!data.assignments || data.assignments.length === 0) {
        setError(
          "No valid assignments found in the provided data. Please check your input."
        );
        return false;
      }

      setParsedGrades(data);
      setUncategorizedAssignments(data.assignments);
      return true;
    } catch (err) {
      console.error("Grade processing error:", err);
      setError("Error processing grades: " + err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      const totalWeight = categories.reduce((sum, cat) => {
        const weight = parseFloat(cat.weight) || 0;
        return sum + weight;
      }, 0);

      const weightDifference = Math.abs(totalWeight - 100);
      const allCategoriesValid =
        categories.length > 0 &&
        categories.every((cat) => cat.name && !isNaN(parseFloat(cat.weight))) &&
        weightDifference < 0.01;

      if (!allCategoriesValid) {
        setError(
          "Please complete all category information and ensure total weight equals 100%"
        );
        return;
      }
    }

    if (activeStep === 1) {
      if (!mode) {
        setError("Please select an input method (Manual or Blackboard)");
        return;
      }

      if (mode === "blackboard") {
        if (!rawGradeData.trim()) {
          setError("Please input your grade data before proceeding");
          return;
        }
        const success = await handleProcessGrades();
        if (!success) return;
      } else if (mode === "manual") {
        if (!manualGrades.length) {
          setError("Please add at least one grade before proceeding");
          return;
        }
        // Skip categorization step for manual input
        setActiveStep(3);
        return;
      }
    }

    if (activeStep === 2 && mode === "blackboard") {
      if (
        !parsedGrades ||
        !parsedGrades.assignments ||
        parsedGrades.assignments.length === 0
      ) {
        setError("Invalid grade data. Please go back and check your input.");
        return;
      }

      if (uncategorizedAssignments.length > 0) {
        setError("Please categorize all assignments before proceeding");
        return;
      }
    }

    setActiveStep((prevStep) => prevStep + 1);
    setError(null);
  };

  const handleSetCategories = (newCategories) => {
    const processedCategories = newCategories.map((cat) => ({
      ...cat,
      weight: parseFloat(cat.weight) || cat.weight,
      assignments: [], // Initialize empty assignments array
    }));
    setCategories(processedCategories);
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
    if (!assignments || !assignments.length) return 0;

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
    if (mode === "manual") {
      return manualGrades.reduce((total, grade) => {
        const category = categories.find((c) => c.name === grade.categoryName);
        if (!category) return total;
        return total + grade.value * (category.weight / 100);
      }, 0);
    }

    return categories.reduce((total, category) => {
      const categoryHypotheticals = hypotheticalAssignments.filter(
        (a) => a.categoryName === category.name
      );

      const allAssignments = [
        ...(category.assignments || []),
        ...categoryHypotheticals,
      ];

      const categoryGrade = calculateCategoryGrade(
        allAssignments,
        category.name
      );
      return total + categoryGrade * (category.weight / 100);
    }, 0);
  };

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      {isLoading && <LoadingOverlay />}
      <Container
        maxWidth={activeStep === 3 ? false : "md"}
        sx={{
          py: 4,
          px: activeStep === 3 ? { xs: 2, sm: 4, md: 6 } : 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transition: "all 0.3s ease",
        }}
      >
        {/* Header */}
        <Typography
          variant="h3"
          component="h1"
          align="center"
          sx={{
            fontWeight: 600,
            color: "primary.main",
            mb: 6,
          }}
        >
          GradeFlow
        </Typography>

        {/* Stepper */}
        <Box
          sx={{
            maxWidth: "md",
            width: "100%",
            mb: 4,
          }}
        >
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2,
              width: "100%",
            }}
          >
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{
              width: "100%",
              mb: 4,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

        {/* Main Content */}
        <Box sx={{ width: "100%", mb: 4 }}>
          {activeStep === 0 && (
            <CategorySetup
              categories={categories}
              setCategories={handleSetCategories}
              error={error}
              setError={setError}
            />
          )}

          {activeStep === 1 && (
            <GradeInput
              mode={mode}
              setMode={setMode}
              rawGradeData={rawGradeData}
              setRawGradeData={setRawGradeData}
              categories={categories}
              setGrades={setManualGrades}
            />
          )}

          {activeStep === 2 && mode === "blackboard" && (
            <CategoryReview
              parsedGrades={parsedGrades}
              uncategorizedAssignments={uncategorizedAssignments}
              categories={categories}
              handleDragEnd={handleDragEnd}
              setUncategorizedAssignments={setUncategorizedAssignments}
              setCategories={setCategories}
            />
          )}

          {activeStep === 3 && (
            <Results
              categories={categories}
              mode={mode}
              manualGrades={manualGrades}
              setManualGrades={setManualGrades}
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
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              calculateCategoryGrade={calculateCategoryGrade}
              calculateWeightedGrade={calculateWeightedGrade}
            />
          )}
        </Box>

        {/* Navigation Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent:
              activeStep === 3 && mode === "manual" ? "center" : "flex-end",
            gap: 2,
            width: activeStep === 3 && mode === "manual" ? "800px" : "100%",
            mt: 4,
            px: 0,
            margin:
              activeStep === 3 && mode === "manual" ? "0 auto" : undefined,
          }}
        >
          {activeStep > 0 && (
            <Button
              variant="outlined"
              onClick={handleBack}
              size="large"
              sx={{
                px: 4,
                minWidth: 120,
              }}
            >
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              size="large"
              sx={{
                px: 4,
                minWidth: 120,
              }}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              size="large"
              sx={{
                px: 4,
                minWidth: 120,
              }}
            >
              Finish
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default App;
