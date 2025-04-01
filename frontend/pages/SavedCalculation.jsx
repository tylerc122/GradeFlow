import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useCalculator } from "../src/contexts/CalculatorContext";
// Lazy load components
const Results = React.lazy(() => import("../components/results/Results"));
const SaveCalculationDialog = React.lazy(() => import("../components/dialogs/SaveCalculationDialog"));
const SavedCalculationHeader = React.lazy(() => import("../components/headers/SavedCalculationHeader"));

import {
  Container,
  CircularProgress,
  Alert,
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const SavedCalculation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const {
    setCategories,
    categories,
    setMode,
    mode,
    whatIfMode,
    setWhatIfMode,
    targetGrade,
    setTargetGrade,
    hypotheticalScores,
    setHypotheticalScores,
    hypotheticalAssignments,
    setHypotheticalAssignments,
    rawGradeData,
    setRawGradeData,
    hiddenAssignments,
    setHiddenAssignments,
    manualGrades,
    setManualGrades,
    resetCalculator,
    setIsResultsView,
    setLastViewedCalculation,
  } = useCalculator();
  
  // Add a ref to store original calculator state
  const originalCalculatorState = useRef(null);
  
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State management
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [lastSaved, setLastSaved] = useState(null);

  // Save original calculator state on mount
  useEffect(() => {
    // Store original calculator state
    originalCalculatorState.current = {
      categories: [...categories],
      mode,
      rawGradeData,
      whatIfMode,
      targetGrade,
      hypotheticalScores: {...hypotheticalScores},
      hypotheticalAssignments: [...hypotheticalAssignments],
      hiddenAssignments: [...hiddenAssignments],
      manualGrades: [...manualGrades]
    };
    
    // Set that we're in the results view for a saved calculation
    setIsResultsView(true);
    
    // Save the current calculation ID to session storage
    setLastViewedCalculation(id);
    
    return () => {
      // Restore original calculator state when component unmounts
      if (originalCalculatorState.current) {
        setCategories(originalCalculatorState.current.categories);
        setMode(originalCalculatorState.current.mode);
        setRawGradeData(originalCalculatorState.current.rawGradeData);
        setWhatIfMode(originalCalculatorState.current.whatIfMode);
        setTargetGrade(originalCalculatorState.current.targetGrade);
        setHypotheticalScores(originalCalculatorState.current.hypotheticalScores);
        setHypotheticalAssignments(originalCalculatorState.current.hypotheticalAssignments);
        setHiddenAssignments(originalCalculatorState.current.hiddenAssignments);
        setManualGrades(originalCalculatorState.current.manualGrades);
      }
      // Clear that we're in results view when leaving
      setIsResultsView(false);
    };
  }, [id]);

  // Add a prompt when users try to leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (saveStatus === "unsaved") {
        // Standard way of showing a browser alert when navigating away
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  // In-app navigation protection
  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  
  // Custom back button handler
  const handleBackToGrades = () => {
    if (saveStatus === "unsaved") {
      setShowPrompt(true);
      setPendingNavigation("/grades");
    } else {
      // Restore original calculator state explicitly before navigating
      if (originalCalculatorState.current) {
        setCategories(originalCalculatorState.current.categories);
        setMode(originalCalculatorState.current.mode);
        setRawGradeData(originalCalculatorState.current.rawGradeData);
        setWhatIfMode(originalCalculatorState.current.whatIfMode);
        setTargetGrade(originalCalculatorState.current.targetGrade);
        setHypotheticalScores(originalCalculatorState.current.hypotheticalScores);
        setHypotheticalAssignments(originalCalculatorState.current.hypotheticalAssignments);
        setHiddenAssignments(originalCalculatorState.current.hiddenAssignments);
        setManualGrades(originalCalculatorState.current.manualGrades);
      }
      // Don't clear the lastViewedCalculation as we want it to persist
      // Just navigate to the grades page
      navigate("/grades");
    }
  };

  // Handle prompt confirmation (leave without saving)
  const handleConfirmNavigation = () => {
    setShowPrompt(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  // Handle prompt cancellation
  const handleCancelNavigation = () => {
    setShowPrompt(false);
    setPendingNavigation(null);
  };

  // Handle saving and then navigating
  const handleSaveAndNavigate = async () => {
    try {
      await handleSaveChanges();
      if (pendingNavigation) {
        navigate(pendingNavigation);
      }
      setShowPrompt(false);
    } catch (error) {
      // If save fails, keep the user on the page
      console.error("Failed to save before navigation:", error);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveStatus("saving");
    try {
      if (!categories?.length) {
        throw new Error("No categories available to save");
      }

      // Create updated categories using context state
      const updatedCategories = categories.map((category) => {
        // Update assignments with hypothetical scores but keep hidden ones
        const updatedAssignments = category.assignments.map((assignment) => {
          const scoreKey = `${category.name}-${assignment.name}`;
          const hypotheticalScore = hypotheticalScores[scoreKey];

          if (hypotheticalScore) {
            // Get the correct score value - prioritize numericScore for calculations
            let scoreValue = 0; // Default to 0
            
            if (hypotheticalScore.numericScore !== undefined && !isNaN(hypotheticalScore.numericScore)) {
              scoreValue = hypotheticalScore.numericScore;
            } else if (hypotheticalScore.score !== undefined) {
              scoreValue = typeof hypotheticalScore.score === 'string' 
                ? Number(hypotheticalScore.score) || 0 // Convert to number, default to 0 if NaN
                : hypotheticalScore.score || 0; // Use score, default to 0 if falsy
            }
            
            // Ensure we always have a valid number
            if (isNaN(scoreValue) || scoreValue === null || scoreValue === undefined) {
              scoreValue = 0;
            }
                 
            console.log(`Saving score for ${assignment.name}: ${scoreValue} (original: ${hypotheticalScore.score})`);
                 
            return {
              ...assignment,
              score: scoreValue,
              status: "GRADED",
              hidden: hiddenAssignments.includes(scoreKey),
            };
          }
          return {
            ...assignment,
            // Ensure all scores are valid numbers
            score: Number(assignment.score) || 0,
            hidden: hiddenAssignments.includes(scoreKey),
          };
        });

        // Add new hypothetical assignments
        const newAssignments = hypotheticalAssignments
          .filter((a) => a.categoryName === category.name)
          .map((assignment) => ({
            name: assignment.name,
            score: Number(assignment.score) || 0, // Ensure score is a valid number
            total_points: Number(assignment.total_points) || 1, // Ensure total_points is valid
            status: "GRADED",
            hidden: false,
          }));

        return {
          ...category,
          assignments: [...updatedAssignments, ...newAssignments],
        };
      });

      // Calculate final grade (only using visible assignments)
      const finalGrade = updatedCategories.reduce((total, category) => {
        const visibleAssignments = category.assignments.filter(
          (a) => !a.hidden
        );
        if (!visibleAssignments.length) return total;

        const totalPoints = visibleAssignments.reduce(
          (sum, a) => sum + Number(a.total_points),
          0
        );
        const earnedPoints = visibleAssignments.reduce(
          (sum, a) => sum + Number(a.score),
          0
        );
        const categoryGrade =
          totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

        return total + categoryGrade * (category.weight / 100);
      }, 0);

      const updatedCalculation = {
        ...calculation,
        categories: updatedCategories,
        results: {
          overall_grade: finalGrade,
          total_points_earned: updatedCategories.reduce(
            (total, category) =>
              total +
              category.assignments
                .filter((a) => !a.hidden)
                .reduce((sum, a) => sum + Number(a.score), 0),
            0
          ),
          total_points_possible: updatedCategories.reduce(
            (total, category) =>
              total +
              category.assignments
                .filter((a) => !a.hidden)
                .reduce((sum, a) => sum + Number(a.total_points), 0),
            0
          ),
        },
      };

      const response = await fetch(`http://localhost:8000/api/grades/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedCalculation),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save changes");
      }

      const savedData = await response.json();
      console.log("Saved data:", savedData);

      // Transform and update all states
      const transformedData = transformCalculationData(savedData);

      // Update both local and context state
      setCalculation(transformedData);
      setCategories(transformedData.categories);
      setRawGradeData(transformedData.raw_data || "");

      // Reset hypothetical scores but maintain what-if mode and hidden assignments
      setHypotheticalAssignments([]);
      setHypotheticalScores({});
      // Do NOT reset hidden assignments or what-if mode
      // setHiddenAssignments([]);
      // setWhatIfMode(false);

      setSaveStatus("saved");
      setLastSaved(new Date());

      // Dispatch event with the final calculated grade
      window.dispatchEvent(
        new CustomEvent("calculationUpdated", {
          detail: {
            id: id,
            newGrade: finalGrade,
          },
        })
      );

      enqueueSnackbar("Changes saved successfully!", { variant: "success" });
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("unsaved");
      enqueueSnackbar(`Failed to save changes: ${error.message}`, {
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async (saveData) => {
    setIsSaving(true);
    try {
      // Validate before duplicating
      if (!calculation?.categories) {
        throw new Error("No calculation data to duplicate");
      }

      const duplicateData = {
        ...saveData,
        raw_data: calculation.raw_data,
        categories: calculation.categories.map((category) => ({
          name: category.name,
          weight: category.weight,
          assignments: [
            ...category.assignments,
            ...hypotheticalAssignments.filter(
              (a) => a.categoryName === category.name
            ),
          ],
        })),
        overall_grade: calculateWeightedGrade(),
      };

      const response = await fetch("http://localhost:8000/api/grades/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(duplicateData),
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate calculation");
      }

      const result = await response.json();
      setDuplicateDialogOpen(false);
      enqueueSnackbar("Calculation duplicated successfully!", {
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
      console.error("Duplication error:", error);
      enqueueSnackbar(`Failed to duplicate calculation: ${error.message}`, {
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Transform data helper function
  const transformCalculationData = (data) => {
    if (!data || !Array.isArray(data.categories)) {
      console.error("Invalid data structure:", data);
      throw new Error("Invalid calculation data structure");
    }

    // Ensure each category has required properties
    const transformedCategories = data.categories.map((category) => {
      if (
        !category.name ||
        typeof category.weight !== "number" ||
        !Array.isArray(category.assignments)
      ) {
        console.error("Invalid category structure:", category);
        throw new Error("Invalid category data structure");
      }

      return {
        ...category,
        weight: Number(category.weight),
        assignments: (category.assignments || []).map((assignment) => ({
          ...assignment,
          name: String(assignment.name || ""),
          status: assignment.status || "GRADED",
          score: Number(assignment.score) || 0, // Ensure score is always a valid number
          total_points: Number(assignment.total_points) || 1, // Ensure total_points is valid
        })),
      };
    });

    return {
      ...data,
      categories: transformedCategories,
    };
  };

  // Calculate grades for categories and overall
  const calculateCategoryGrade = (assignments, categoryName) => {
    if (!assignments || !assignments.length) return 0;

    const allAssignments = assignments.map((assignment) => {
      if (assignment.status === "UPCOMING" || assignment.isHypothetical) {
        const hypotheticalKey = `${categoryName}-${assignment.name}`;
        const hypotheticalScore = hypotheticalScores[hypotheticalKey];
        return hypotheticalScore || assignment;
      }
      return assignment;
    });

    const totalEarned = allAssignments.reduce((sum, a) => {
      const scoreKey = `${categoryName}-${a.name}`;
      const score = hypotheticalScores[scoreKey]?.score ?? a.score;
      return sum + score;
    }, 0);

    const totalPossible = allAssignments.reduce(
      (sum, a) => sum + a.total_points,
      0
    );

    return totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
  };

  const calculateWeightedGrade = () => {
    if (!categories?.length) {
      console.error("No categories available for grade calculation");
      return 0;
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

  useEffect(() => {
    const fetchCalculation = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/grades/${id}`, {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate("/login");
            return;
          }
          throw new Error(
            response.status === 404
              ? "Calculation not found"
              : "Failed to fetch calculation"
          );
        }

        const data = await response.json();
        const transformedData = transformCalculationData(data);

        // Extract hidden assignments from the loaded data
        const loadedHiddenAssignments = [];
        transformedData.categories.forEach((category) => {
          category.assignments.forEach((assignment) => {
            if (assignment.hidden) {
              loadedHiddenAssignments.push(
                `${category.name}-${assignment.name}`
              );
            }
          });
        });

        // Create a temporary context for this saved calculation view only
        // Don't reset the original calculator context completely
        setCalculation(transformedData);
        
        // Using setCategories here is necessary for the calculation display
        // but we'll restore the original state when leaving this view
        setCategories(transformedData.categories);
        
        // For these viewing settings, we use local state when available to avoid context pollution
        setHiddenAssignments(loadedHiddenAssignments);
        setHypotheticalAssignments([]);
        setHypotheticalScores({});
        
        // We need these for the calculation to work, but they don't affect the calculator flow
        setRawGradeData(transformedData.raw_data || "");
        setMode("blackboard");

        setError(null);
        setSaveStatus("saved");
      } catch (err) {
        console.error("Error in fetchCalculation:", err);
        setError(err.message);
        enqueueSnackbar(err.message, { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [
    id,
    navigate,
    enqueueSnackbar,
    setCategories,
    setMode,
    setHypotheticalAssignments,
    setHypotheticalScores,
    setRawGradeData,
  ]);

  // Tracks changes
  useEffect(() => {
    if (
      whatIfMode &&
      (Object.keys(hypotheticalScores).length > 0 ||
        hypotheticalAssignments.length > 0)
    ) {
      if (saveStatus !== "saving") {
        setSaveStatus("unsaved");
      }
    }
  }, [hypotheticalScores, hypotheticalAssignments, saveStatus, whatIfMode]);

  // Enhanced function to check for unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return saveStatus === "unsaved";
  }, [saveStatus]);

  if (loading) {
    return (
      <Container
        sx={{
          py: 8,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert
          severity="error"
          sx={{ mb: 4 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setLoading(true);
                setError(null);
                setRetryCount(0);
                window.location.reload();
              }}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  // Validate calculation data before rendering
  if (!calculation?.categories?.length) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert
          severity="error"
          sx={{ mb: 4 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
          }
        >
          No categories found in calculation. Please try reloading the page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="140%" sx={{ py: 4 }}>
      <Suspense fallback={<CircularProgress />}>
        <SavedCalculationHeader
          calculationName={calculation?.name || "Unnamed Calculation"}
          whatIfMode={whatIfMode}
          isSaving={isSaving}
          onSave={handleSaveChanges}
          onDuplicate={() => setDuplicateDialogOpen(true)}
          lastSaved={lastSaved}
          saveStatus={saveStatus}
          onNavigateBack={handleBackToGrades}
        />
      </Suspense>

      <Suspense fallback={<CircularProgress />}>
        <Results
          mode="blackboard"
          rawGradeData={calculation.raw_data || ""}
          parsedGrades={{
            assignments: categories.flatMap((cat) => cat.assignments || []),
          }}
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
          showCalculateAnotherButton={false}
          isSavedCalculation={true}
        />
      </Suspense>

      <Suspense fallback={<CircularProgress />}>
        <SaveCalculationDialog
          open={duplicateDialogOpen}
          onClose={() => setDuplicateDialogOpen(false)}
          onSave={handleDuplicate}
          loading={isSaving}
          title="Duplicate Calculation"
          defaultName={`Copy of ${calculation?.name}`}
        />
      </Suspense>

      {/* Navigation Confirmation Dialog */}
      <Dialog
        open={showPrompt}
        onClose={handleCancelNavigation}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Unsaved Changes</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Are you sure you want to leave? All unsaved changes will be lost.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelNavigation} variant="outlined">
            Stay on Page
          </Button>
          <Button 
            onClick={handleConfirmNavigation} 
            variant="contained" 
            color="error"
          >
            Leave Without Saving
          </Button>
          <Button 
            onClick={handleSaveAndNavigate} 
            variant="contained" 
            color="primary"
            disabled={isSaving}
          >
            Save and Leave
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SavedCalculation;
