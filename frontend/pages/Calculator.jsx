/**
 * The orchestrator of the app. Surprisingly, had less trouble coding this than the results page.
 */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useAuth } from "../src/contexts/AuthContext";
import SaveIcon from "@mui/icons-material/Save";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  Paper,
  Container,
  useTheme as useMuiTheme,
  Fab,
  Zoom,
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
    hypotheticalScores,
    hypotheticalAssignments,
    hiddenAssignments,
    setHiddenAssignments,
    setIsResultsView,
  } = useCalculator();

  // State and Ref for floating button visibility
  const [showFloatingNext, setShowFloatingNext] = useState(false);
  const bottomNavRef = useRef(null);

  // Effect to observe the original navigation buttons
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show floating button when original is NOT intersecting (out of view)
        setShowFloatingNext(!entry.isIntersecting);
      },
      { threshold: 0.1 } // Trigger when less than 10% is visible
    );

    const currentRef = bottomNavRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    // Cleanup observer on component unmount or when ref changes
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [bottomNavRef.current]); // Rerun if the ref changes

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

  const handleSave = async (saveData) => {
    setIsSaving(true);
    setSavingError(null);

    try {
      // Calculate the overall grade properly before adding to calculation data
      let overallGrade;
      if (calculatorMode === "manual") {
        overallGrade = calculateManualGradePercentage();
      } else {
        // For blackboard mode, explicitly calculate with proper checks
        overallGrade = categories.reduce((total, category) => {
          const categoryHypotheticals = hypotheticalAssignments.filter(
            (a) => a.categoryName === category.name
          );

          const allAssignments = [
            ...(category.assignments || []),
            ...categoryHypotheticals,
          ];
          
          // Filter out hidden assignments
          const visibleAssignments = allAssignments.filter(
            (assignment) => !hiddenAssignments.includes(`${category.name}-${assignment.name}`)
          );
          
          if (!visibleAssignments.length) return total;
          
          // Calculate category grade
          let totalEarned = 0;
          let totalPossible = 0;
          
          visibleAssignments.forEach(assignment => {
            const scoreKey = `${category.name}-${assignment.name}`;
            const score = hypotheticalScores[scoreKey]?.score ?? assignment.score;
            
            // Ensure values are valid numbers
            const numericScore = Number(score) || 0;
            const numericTotal = Number(assignment.total_points) || 1;
            
            totalEarned += numericScore;
            totalPossible += numericTotal;
          });
          
          const categoryGrade = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
          const weightedGrade = categoryGrade * (category.weight / 100);
          
          return total + weightedGrade;
        }, 0);
      }

      // Validate that the overall grade is not negative or invalid
      if (overallGrade < 0 || !isFinite(overallGrade) || isNaN(overallGrade)) {
        console.warn(`Invalid calculated grade: ${overallGrade}. Defaulting to 0.`);
        overallGrade = 0;
      }

      const calculationData = {
        ...saveData,
        raw_data: rawGradeData,
        calculation_mode: calculatorMode,
        categories: categories.map((category) => ({
          name: category.name,
          weight: category.weight,
          assignments: [
            ...(category.assignments || []).map(assignment => {
              // For each assignment, check if there's a hypothetical score
              const scoreKey = `${category.name}-${assignment.name}`;
              const hypotheticalScore = hypotheticalScores[scoreKey];
              
              if (hypotheticalScore) {
                // If there's a hypothetical score, use it
                return {
                  ...assignment,
                  score: hypotheticalScore.score,
                  originalScore: assignment.score, // Store the original score
                  hasHypotheticalScore: true
                };
              }
              
              return assignment;
            }),
            ...hypotheticalAssignments.filter(
              (a) => a.categoryName === category.name
            ),
          ],
        })),
        // Save hypothetical scores separately for reference
        hypothetical_scores: hypotheticalScores,
        // Use the validated overall grade
        overall_grade: overallGrade,
        total_points_earned: categories.reduce((total, category) => {
          return (
            total +
            (category.assignments || []).reduce((sum, assignment) => {
              // Use hypothetical score if available
              const scoreKey = `${category.name}-${assignment.name}`;
              const score = (hypotheticalScores[scoreKey]?.score !== undefined) 
                ? hypotheticalScores[scoreKey].score 
                : assignment.score;
                
              if (assignment.status === "GRADED") {
                return sum + score;
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

  // helper function to calculate grade from manual input
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
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
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
                ml: { xs: 0, sm: 2.7 },
                width: { xs: '100%', sm: 'calc(100% - 0.7%)' }
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
          </div>
        </div>
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
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: muiTheme.palette.background.default,
        paddingTop: "32px",
        paddingBottom: "32px",
      }}
    >
      {isLoading && <LoadingOverlay />}

      <Container maxWidth="xl">
        <div
          style={{
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

          {/* Original Navigation Buttons - Add ref here */}
          <div
            ref={bottomNavRef}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "16px",
              marginTop: "32px",
              marginBottom: "32px",
              width: activeStep === 3 ? "150%" : "100%",
              maxWidth: activeStep === 3 ? "95vw" : "100%",
              transition: "all 0.3s ease-in-out",
              minHeight: '50px',
            }}
          >
            {activeStep > 0 && (
              <Button
                variant="outlined"
                onClick={handleBack}
                size="large"
                sx={{ px: 4, minWidth: 120 }}
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
          </div>
        </div>

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
            manualGrades,
            mode: calculatorMode,
          }}
        />
      </Container>

      {/* Floating Action Buttons */}
      {/* Back Button FAB */}
      <Zoom
         in={showFloatingNext && activeStep > 0} // Show when original buttons hidden AND not on first step
         timeout={300}
         unmountOnExit
      >
        <Fab
          color="secondary"
          aria-label="previous step"
          onClick={handleBack}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32 + 56 + 16, // Place it to the left of the Next FAB (based on large size)
            zIndex: 1200,
          }}
        >
          <NavigateBeforeIcon />
        </Fab>
      </Zoom>

      {/* Next Button FAB */}
      <Zoom
        in={showFloatingNext && activeStep < 3}
        timeout={300}
        unmountOnExit
      >
        <Fab
          color="primary"
          aria-label="next step"
          onClick={handleNext}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32, // Stays in the corner
            zIndex: 1200,
          }}
        >
          <NavigateNextIcon />
        </Fab>
      </Zoom>

    </div>
  );
};

export default Calculator;
