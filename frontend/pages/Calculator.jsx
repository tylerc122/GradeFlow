import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useAuth } from "../src/contexts/AuthContext";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  Paper,
  Container,
  useTheme as useMuiTheme,
  alpha,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import GradeInput from "../components/step2/GradeInput";
import CategoryReview from "../components/step3/CategoryReview";
import CategorySetup from "../components/CategorySetup";
import WelcomeSection from "../components/WelcomeSection";
import LoadingOverlay from "../components/LoadingOverlay";
import Results from "../components/results/Results";
import SaveCalculationDialog from "../components/dialogs/SaveCalculationDialog";
import { useCalculator } from "../src/contexts/CalculatorContext";
import { useTheme } from "../src/contexts/ThemeContext";
import {
  letterGradeToPoints,
  isLetterGrade,
} from "../src/utils/letterGradeUtils";
import { RefreshCw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Calculator = () => {
  const muiTheme = useMuiTheme();
  const { mode, isDark } = useTheme();

  // Step tracking
  const steps = [
    "Set Categories",
    "Input Grades",
    "Review & Categorize",
    "View Results",
  ];

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Save calculation state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savingError, setSavingError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Get all state from context
  const {
    activeStep,
    setActiveStep,
    categories,
    setCategories,
    error,
    setError,
    mode: calculatorMode,
    setMode: setCalculatorMode,
    rawGradeData,
    setRawGradeData,
    parsedGrades,
    setParsedGrades,
    uncategorizedAssignments,
    setUncategorizedAssignments,
    manualGrades,
    setManualGrades,
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
    selectedCategory,
    setSelectedCategory,
    hiddenAssignments,
    setHiddenAssignments,
    resetCalculator,
    activeStep: contextActiveStep,
    setActiveStep: setContextActiveStep,
    setIsResultsView,
    showCalculateAnotherButton,
  } = useCalculator();

  // Update calculation function to use hidden assignments
  const calculateCategoryGrade = (assignments, categoryName) => {
    console.log(`\nCalculating grade for ${categoryName}`);
    console.log("Hidden assignments:", hiddenAssignments);

    if (!assignments || !assignments.length) return 0;

    // Filter out hidden assignments first
    const visibleAssignments = assignments.filter(
      (assignment) =>
        !hiddenAssignments.includes(`${categoryName}-${assignment.name}`)
    );

    console.log(`Total assignments: ${assignments.length}`);
    console.log(`Visible assignments: ${visibleAssignments.length}`);

    if (!visibleAssignments.length) return 0;

    const totalEarned = visibleAssignments.reduce((sum, a) => {
      const scoreKey = `${categoryName}-${a.name}`;
      const score = hypotheticalScores[scoreKey]?.score ?? a.score;
      return sum + score;
    }, 0);

    const totalPossible = visibleAssignments.reduce(
      (sum, a) => sum + a.total_points,
      0
    );

    const grade = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
    console.log(`Category grade: ${grade}%\n`);
    return grade;
  };

  // Update the original calculateCategoryGrade function
  const originalCalculateCategoryGrade = calculateCategoryGrade;

  // Wrap the calculation to include hidden assignments
  const wrappedCalculateCategoryGrade = (assignments, categoryName) => {
    console.log(
      "Current hidden assignments in calculation:",
      hiddenAssignments
    );

    // Filter out hidden assignments
    const visibleAssignments = assignments.filter(
      (assignment) =>
        !hiddenAssignments.includes(`${categoryName}-${assignment.name}`)
    );

    console.log(`Category ${categoryName}:`);
    console.log("- Original assignments:", assignments.length);
    console.log("- Visible assignments:", visibleAssignments.length);

    // Use the original calculation function with filtered assignments
    return originalCalculateCategoryGrade(visibleAssignments, categoryName);
  };

  const handleToggleAssignmentVisibility = (categoryName, assignmentName) => {
    console.log(
      "Toggling visibility for:",
      `${categoryName}-${assignmentName}`
    );
    setHiddenAssignments((prev) => {
      const assignmentKey = `${categoryName}-${assignmentName}`;
      const newHidden = prev.includes(assignmentKey)
        ? prev.filter((key) => key !== assignmentKey)
        : [...prev, assignmentKey];
      console.log("Updated hidden assignments:", newHidden);
      return newHidden;
    });
  };

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
        `${API_URL}/api/grades/calculate/raw`,
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

  const calculateWeightedGrade = () => {
    console.log("\nCalculating final weighted grade");
    if (calculatorMode === "manual") {
      let totalWeightedPoints = 0;
      let totalWeight = 0;
      let hasLetterGrades = false;

      categories.forEach((category) => {
        const grade = manualGrades.find(
          (g) => g.categoryName === category.name
        );
        if (grade) {
          if (grade.isLetter && isLetterGrade(grade.grade)) {
            hasLetterGrades = true;
            // Get GPA points directly
            const points = letterGradeToPoints(grade.grade);
            totalWeightedPoints += points * category.weight;
          } else {
            totalWeightedPoints += grade.value * category.weight;
          }
          totalWeight += category.weight;
        }
      });

      return {
        percentage: totalWeight > 0 ? totalWeightedPoints / totalWeight : 0,
        hasLetterGrades
      };
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
      const weightedGrade = categoryGrade * (category.weight / 100);
      console.log(
        `${category.name}: ${categoryGrade}% * ${category.weight}% = ${weightedGrade}%`
      );

      return total + weightedGrade;
    }, 0);
  };

  const handleSave = async (saveData) => {
    setIsSaving(true);
    setSavingError(null);

    try {
      const calculationData = {
        ...saveData,
        raw_data: rawGradeData,
        calculation_mode: calculatorMode,
        categories: categories.map((category) => ({
          name: category.name,
          weight: category.weight,
          assignments: [
            ...(category.assignments || []),
            ...hypotheticalAssignments.filter(
              (a) => a.categoryName === category.name
            ),
          ],
        })),
        // Use a proper calculation for overall_grade that handles both number and letter grades
        overall_grade:
          calculatorMode === "manual"
            ? calculateManualGradePercentage()
            : calculateWeightedGrade(),
        total_points_earned: categories.reduce((total, category) => {
          return (
            total +
            (category.assignments || []).reduce((sum, assignment) => {
              if (assignment.status === "GRADED") {
                return sum + assignment.score;
              }
              return sum;
            }, 0)
          );
        }, 0),
        total_points_possible: categories.reduce((total, category) => {
          return (
            total +
            (category.assignments || []).reduce((sum, assignment) => {
              if (assignment.status === "GRADED") {
                return sum + assignment.total_points;
              }
              return sum;
            }, 0)
          );
        }, 0),
      };

      // For manual mode, also save the manualGrades array
      if (calculatorMode === "manual") {
        calculationData.manualGrades = manualGrades;
      }

      const response = await fetch(`${API_URL}/api/grades/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(calculationData),
      });

      if (!response.ok) {
        throw new Error("Failed to save calculation");
      }

      const result = await response.json();
      setSaveDialogOpen(false);
      enqueueSnackbar("Calculation saved successfully!", {
        variant: "success",
        action: (key) => (
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              navigate(`/grades/${result.id}`);
            }}
          >
            View
          </Button>
        ),
      });
    } catch (error) {
      setSavingError(error.message);
      enqueueSnackbar("Failed to save calculation", { variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Add this helper function to calculate grade from manual input
  const calculateManualGradePercentage = () => {
    let totalWeightedPoints = 0;
    let totalWeight = 0;
    let hasLetterGrades = false;

    categories.forEach((category) => {
      const grade = manualGrades.find((g) => g.categoryName === category.name);
      if (grade) {
        if (grade.isLetter && isLetterGrade(grade.grade)) {
          hasLetterGrades = true;
          // Use the actual GPA points directly for letter grades
          const points = letterGradeToPoints(grade.grade);
          totalWeightedPoints += points * category.weight;
        } else if (grade.value !== null) {
          // For percentage grades, keep as is
          totalWeightedPoints += grade.value * category.weight;
        }
        totalWeight += category.weight;
      }
    });

    // If letter grades were used, return GPA directly
    // Otherwise, return percentage as before
    if (hasLetterGrades) {
      return totalWeight > 0 ? totalWeightedPoints / totalWeight : 0;
    } else {
      return totalWeight > 0 ? totalWeightedPoints / totalWeight : 0;
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
      if (!calculatorMode) {
        setError("Please select an input method (Manual or Blackboard)");
        return;
      }

      if (calculatorMode === "blackboard") {
        if (!rawGradeData.trim()) {
          setError("Please input your grade data before proceeding");
          return;
        }
        const success = await handleProcessGrades();
        if (!success) return;
      } else if (calculatorMode === "manual") {
        if (!manualGrades.length) {
          setError("Please add at least one grade before proceeding");
          return;
        }
        // Skip categorization step for manual input
        setActiveStep(3);
        return;
      }
    }

    if (activeStep === 2 && calculatorMode === "blackboard") {
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

      // Only set isResultsView to true after all validations pass
      setIsResultsView(true);
    }

    setActiveStep((prevStep) => prevStep + 1);
    setError(null);
  };

  const handleBack = () => {
    if (activeStep === 3) {
      // When leaving results view
      setIsResultsView(false);
      // Clear isResultsView from sessionStorage too
      sessionStorage.removeItem('isResultsView');
      // If in manual mode, go back to step 1 (grade input) instead of step 2 (categorization)
      if (calculatorMode === "manual") {
        setActiveStep(1);
      } else {
        setActiveStep(2);
      }
    } else if (activeStep === 2) {
      // When going from step 2 (categorization) back to step 1 (grade input)
      // Clear all assignments from categories
      setCategories(categories.map(category => ({
        ...category,
        assignments: []
      })));
      // Reset uncategorized assignments to ensure a fresh calculation
      setUncategorizedAssignments([]);
      // Also clear localStorage to prevent persistence
      localStorage.removeItem('gradeCategories');
      
      setActiveStep(1);
    } else {
      setActiveStep((prevStep) => prevStep - 1);
    }
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

    // Ensure assignments array exists for all categories
    newCategories = newCategories.map((category) => ({
      ...category,
      assignments: category.assignments || [],
    }));

    let draggedItem;

    // Handle dragging from uncategorized area
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
    }
    // Handle dragging from a category
    else if (sourceId.startsWith("category-")) {
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

  const renderMainContent = () => {
    if (activeStep === 3) {
      return (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: "145%",
              maxWidth: "95vw",
            }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                mb: 2,
                bgcolor: "background.default",
                ml: { xs: 0, sm: 2 },
                width: { xs: '100%', sm: 'calc(100% - 0.8%)' }
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

            <Results />
          </Box>
        </Box>
      );
    }

    return (
      <Grid container spacing={6} sx={{ minHeight: "70vh", mt: 1 }}>
        {/* Welcome Section - Always shown except on Results page */}
        <Grid item xs={12} md={6} sx={{ mb: 4 }}>
          <WelcomeSection />
        </Grid>

        {/* Content Section */}
        <Grid item xs={12} md={6} sx={{ mb: 4 }}>
          <Paper
            elevation={2}
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: "background.default",
              height: "100%",
            }}
          >
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
                mode={calculatorMode}
                setMode={setCalculatorMode}
                rawGradeData={rawGradeData}
                setRawGradeData={setRawGradeData}
                categories={categories}
                setGrades={setManualGrades}
                manualGrades={manualGrades}
              />
            )}

            {activeStep === 2 && calculatorMode === "blackboard" && (
              <CategoryReview
                parsedGrades={parsedGrades}
                uncategorizedAssignments={uncategorizedAssignments}
                categories={categories}
                handleDragEnd={handleDragEnd}
                setUncategorizedAssignments={setUncategorizedAssignments}
                setCategories={setCategories}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        pt: 4,
        pb: 4,
      }}
    >
      {isLoading && <LoadingOverlay />}

      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: activeStep === 3 ? "center" : "stretch",
            width: "100%",
            transition: "all 0.3s ease-in-out",
          }}
        >
          {/* Only show stepper here for non-results steps */}
          {activeStep !== 3 && (
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                mb: 2,
                bgcolor: "background.default",
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
          )}

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
          {renderMainContent()}

          {/* Navigation Buttons - align based on step */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 4,
              mb: 4,
              width: activeStep === 3 ? "150%" : "100%",
              maxWidth: activeStep === 3 ? "95vw" : "100%",
              transition: "all 0.3s ease-in-out",
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
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={() => {
                  if (user) {
                    setSaveDialogOpen(true);
                  } else {
                    enqueueSnackbar("Please log in to save your calculation", {
                      variant: "info",
                      action: (key) => (
                        <Button
                          color="inherit"
                          size="small"
                          onClick={() => {
                            navigate("/login");
                          }}
                        >
                          Login
                        </Button>
                      ),
                    });
                    navigate("/login");
                  }
                }}
                startIcon={<SaveIcon />}
                size="large"
                sx={{
                  px: 4,
                  minWidth: 120,
                }}
              >
                {user ? "Save Calculation" : "Login to Save"}
              </Button>
            ) : (
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
            )}
          </Box>
        </Box>

        <SaveCalculationDialog
          open={saveDialogOpen}
          onClose={() => {
            setSaveDialogOpen(false);
            setSavingError(null);
          }}
          onSave={handleSave}
          loading={isSaving}
          error={savingError}
          calculationData={{
            categories,
            hypotheticalAssignments,
            rawGradeData,
          }}
        />
      </Container>
    </Box>
  );
};

export default Calculator;
