import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  CircularProgress,
  Alert,
  Box,
  Button,
  Typography,
  Paper,
} from "@mui/material";
import { useSnackbar } from "notistack";
import Results from "../components/results/Results";
import SaveIcon from "@mui/icons-material/Save";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SaveCalculationDialog from "../components/dialogs/SaveCalculationDialog";

const SavedCalculation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // What-if analysis states
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [targetGrade, setTargetGrade] = useState("");
  const [hypotheticalScores, setHypotheticalScores] = useState({});
  const [hypotheticalAssignments, setHypotheticalAssignments] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Save/Duplicate states
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCalculation = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/grades/${id}`, {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Calculation not found");
          }
          throw new Error("Failed to fetch calculation");
        }

        const data = await response.json();

        // Transform data to match Results component expectations
        const transformedData = {
          ...data,
          categories: data.categories.map((cat) => ({
            ...cat,
            assignments: cat.assignments.map((assignment) => ({
              ...assignment,
              status: "GRADED",
              score: parseFloat(assignment.score),
              total_points: parseFloat(assignment.total_points),
            })),
          })),
        };

        setCalculation(transformedData);
      } catch (err) {
        setError(err.message);
        enqueueSnackbar(err.message, { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [id, enqueueSnackbar]);

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
    if (!calculation || !calculation.categories) return 0;

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

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Create the updated data
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

      const savedCalculation = await response.json();

      // Transform the data to match our expected format
      const transformedData = {
        ...savedCalculation,
        categories: savedCalculation.categories.map((cat) => ({
          ...cat,
          assignments: cat.assignments.map((assignment) => ({
            ...assignment,
            status: "GRADED",
            score: parseFloat(assignment.score),
            total_points: parseFloat(assignment.total_points),
          })),
        })),
      };

      setCalculation(transformedData);
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
      enqueueSnackbar("Failed to duplicate calculation", { variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !calculation) {
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
              onClick={() => navigate("/grades")}
            >
              Back to My Grades
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Action Buttons */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
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

      {/* Results Component */}
      <Results
        categories={calculation?.categories || []}
        mode="blackboard"
        rawGradeData={calculation?.raw_data || ""}
        parsedGrades={{
          assignments:
            calculation?.categories?.flatMap((cat) => cat.assignments) || [],
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
        calculateCategoryGrade={calculateCategoryGrade}
        calculateWeightedGrade={calculateWeightedGrade}
      />

      {/* Duplicate Dialog */}
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
