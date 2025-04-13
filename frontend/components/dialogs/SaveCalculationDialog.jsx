/**
 * Dialog that pops up when user wants to save their current calculation.
 * Allows user to enter a name for the calculation and save it.
 * Shows a preview of what will be saved with some details ab it.
 */
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Typography,
  alpha,
  Divider,
  CircularProgress,
  useTheme,
  Chip,
} from "@mui/material";
import { Save, FileText, X, Info } from "lucide-react";
import { motion } from "framer-motion";

const SaveCalculationDialog = ({
  open,
  onClose,
  onSave,
  calculationData,
  loading = false,
  error = null,
  title = "Save Calculation",
  defaultName = "",
}) => {
  const theme = useTheme();
  const [name, setName] = useState(defaultName);
  const [nameTouched, setNameTouched] = useState(false);

  // For visual preview feedback
  const hasCategories = calculationData?.categories?.length > 0;
  const totalAssignments = hasCategories
    ? calculationData.categories.reduce((sum, category) => {
        return sum + (category.assignments?.length || 0);
      }, 0)
    : 0;

  // Get hypothetical assignments for the preview
  const hypotheticalCount = hasCategories
    ? calculationData.hypotheticalAssignments?.length || 0
    : 0;

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setNameTouched(false);
    }
  }, [open, defaultName]);

  const handleSave = async () => {
    if (!name.trim()) {
      setNameTouched(true);
      return;
    }

    try {
      await onSave({
        name,
        categories: calculationData.categories,
        hypotheticalAssignments: calculationData.hypotheticalAssignments,
        hypotheticalScores: calculationData.hypotheticalScores,
        hiddenAssignments: calculationData.hiddenAssignments,
        whatIfMode: calculationData.whatIfMode,
        rawGradeData: calculationData.rawGradeData,
      });
      setName("");
      setNameTouched(false);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const nameError =
    nameTouched && !name.trim() ? "Calculation name is required" : "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 4,
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
          backgroundColor: "background.default",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        {/* Header with gradient */}
        <Box
          sx={{
            p: 3,
            background: "var(--gradient-primary)",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <Box
            sx={{
              position: "absolute",
              right: "-20px",
              top: "-20px",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              zIndex: 0,
            }}
          />

          <Box
            sx={{
              position: "absolute",
              left: "20px",
              bottom: "-50px",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              zIndex: 0,
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <DialogTitle
              sx={{
                p: 0,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                color: "white",
                fontWeight: 700,
                fontSize: "1.5rem",
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={24} />
              </Box>
              {title}
            </DialogTitle>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.8)", mt: 1 }}
            >
              Save your current calculation to access it later
            </Typography>
          </Box>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: "12px",
                  boxShadow: `0 4px 12px ${alpha(
                    theme.palette.error.main,
                    0.15
                  )}`,
                }}
              >
                {error}
              </Alert>
            )}

            <TextField
              autoFocus
              label="Calculation Name"
              placeholder="Enter a memorable name"
              fullWidth
              value={name}
              error={!!nameError}
              helperText={nameError}
              onChange={(e) => {
                setName(e.target.value);
                if (!nameTouched) setNameTouched(true);
              }}
              InputProps={{
                sx: {
                  borderRadius: "12px",
                  backgroundColor: "white",
                  transition: "all 0.2s ease-in-out",
                  "& fieldset": {
                    borderColor:
                      nameTouched && !name.trim()
                        ? theme.palette.error.main
                        : theme.palette.divider,
                  },
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 3px ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}`,
                  },
                },
              }}
              sx={{ mb: 3 }}
            />

            {/* Preview of what will be saved */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Info size={16} color={theme.palette.primary.main} />
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    fontWeight={600}
                  >
                    Calculation Summary
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Categories
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {hasCategories ? calculationData.categories.length : 0}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Assignments
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {totalAssignments}
                    </Typography>
                  </Box>

                  {hypotheticalCount > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Hypothetical Assignments
                      </Typography>
                      <Chip
                        label={hypotheticalCount}
                        size="small"
                        color="info"
                        sx={{
                          height: 22,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </motion.div>
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={onClose}
            color="inherit"
            sx={{
              borderRadius: "10px",
              px: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontWeight: 500,
            }}
            startIcon={<X size={18} />}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || !name.trim()}
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Save size={18} />
              )
            }
            sx={{
              borderRadius: "10px",
              px: 3,
              py: 1,
              background: "var(--gradient-primary)",
              boxShadow: `0 4px 12px ${alpha(
                theme.palette.primary.main,
                0.25
              )}`,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                boxShadow: `0 6px 16px ${alpha(
                  theme.palette.primary.main,
                  0.35
                )}`,
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                background: theme.palette.action.disabledBackground,
                boxShadow: "none",
              },
            }}
          >
            {loading ? "Saving..." : "Save Calculation"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default SaveCalculationDialog;
