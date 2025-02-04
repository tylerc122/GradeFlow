import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useCalculator } from "../src/contexts/CalculatorContext"; // Added this import
import Results from "../components/results/Results";
import SaveIcon from "@mui/icons-material/Save";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SaveCalculationDialog from "../components/dialogs/SaveCalculationDialog";
import {
  Container,
  CircularProgress,
  Alert,
  Box,
  Button,
  Typography,
  Paper,
} from "@mui/material";

const SavedCalculation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { setCategories } = useCalculator(); // Added this
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State management
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [targetGrade, setTargetGrade] = useState("");
  const [hypotheticalScores, setHypotheticalScores] = useState({});
  const [hypotheticalAssignments, setHypotheticalAssignments] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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
          score: Number(assignment.score || 0),
          total_points: Number(assignment.total_points || 0),
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
    if (!calculation?.categories) {
      console.error("No categories available for grade calculation");
      return 0;
    }

    return calculation.categories.reduce((total, category) => {
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
        console.log("Fetching calculation:", id);
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
        console.log("Raw calculation data:", data);

        if (!data || !data.categories || !Array.isArray(data.categories)) {
          throw new Error("Invalid calculation data structure");
        }

        // Transform and validate the data
        const transformedData = transformCalculationData(data);
        console.log("Transformed calculation data:", transformedData);

        // Additional validation
        if (!transformedData.categories.length) {
          throw new Error("No categories found in calculation");
        }

        if (
          !transformedData.categories.every(
            (cat) =>
              Array.isArray(cat.assignments) &&
              typeof cat.weight === "number" &&
              typeof cat.name === "string"
          )
        ) {
          throw new Error("Invalid category structure detected");
        }

        setCalculation(transformedData);
        setCategories(transformedData.categories); // Added this line
        setError(null);
      } catch (err) {
        console.error("Error in fetchCalculation:", err);
        setError(err.message);
        enqueueSnackbar(err.message, { variant: "error" });

        // Auto-retry once if it's a data structure error
        if (retryCount === 0 && err.message.includes("Invalid")) {
          setRetryCount((prev) => prev + 1);
          setTimeout(() => {
            setLoading(true);
            setError(null);
          }, 1000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [id, navigate, enqueueSnackbar, retryCount, setCategories]); // Added setCategories to deps

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Validate before saving
      if (!calculation?.categories) {
        throw new Error("No calculation data to save");
      }

      const updatedData = {
        ...calculation,
        name: calculation.name,
        raw_data: calculation.raw_data,
        categories: calculation.categories.map((category) => ({
          name: category.name,
          weight: category.weight,
          assignments: [
            ...category.assignments,
            ...hypotheticalAssignments.filter(
              (a) => a.categoryName === category.name
            ),
          ].map((assignment) => ({
            name: assignment.name,
            score: parseFloat(assignment.score),
            total_points: parseFloat(assignment.total_points),
            status: "GRADED",
          })),
        })),
        results: {
          overall_grade: calculateWeightedGrade(),
          total_points_earned: calculation.results.total_points_earned,
          total_points_possible: calculation.results.total_points_possible,
        },
      };

      console.log("Sending update with data:", updatedData);

      const response = await fetch(`http://localhost:8000/api/grades/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(errorData.detail || "Failed to save changes");
      }

      const savedData = await response.json();
      const transformedData = transformCalculationData(savedData);

      setCalculation(transformedData);
      setCategories(transformedData.categories); // Added this line
      setHypotheticalAssignments([]);
      setHypotheticalScores({});
      setWhatIfMode(false);
      enqueueSnackbar("Changes saved successfully!", { variant: "success" });
    } catch (error) {
      console.error("Save error:", error);
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
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
          maxWidth: "99.5%",
          ml: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            {calculation?.name}
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            {whatIfMode && (
              <Button
                variant="contained"
                onClick={handleSaveChanges}
                startIcon={<SaveIcon />}
                disabled={isSaving}
              >
                Save Changes
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={() => setDuplicateDialogOpen(true)}
              startIcon={<ContentCopyIcon />}
              disabled={isSaving}
            >
              Duplicate
            </Button>
          </Box>
        </Box>
      </Paper>

      <Results
        mode="blackboard"
        rawGradeData={calculation.raw_data || ""}
        parsedGrades={{
          assignments: calculation.categories.flatMap(
            (cat) => cat.assignments || []
          ),
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
      />

      <SaveCalculationDialog
        open={duplicateDialogOpen}
        onClose={() => setDuplicateDialogOpen(false)}
        onSave={handleDuplicate}
        loading={isSaving}
        title="Duplicate Calculation"
        defaultName={`Copy of ${calculation?.name}`}
      />
    </Container>
  );
};

export default SavedCalculation;
