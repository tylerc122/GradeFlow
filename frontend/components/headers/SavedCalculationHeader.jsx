import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutorenewIcon from "@mui/icons-material/Autorenew";

const SavedCalculationHeader = ({
  calculationName,
  whatIfMode,
  isSaving,
  onSave,
  onDuplicate,
  lastSaved,
  saveStatus,
  setSaveStatus,
}) => {
  const navigate = useNavigate();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  // Auto-save functionality
  useEffect(() => {
    if (whatIfMode && saveStatus === "unsaved") {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      const timer = setTimeout(() => {
        handleSave();
      }, 3000); // Auto-save after 3 seconds of no changes
      setAutoSaveTimer(timer);
    }
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [whatIfMode, saveStatus]);

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await onSave();
      setSaveStatus("saved");
      setShowSaveSuccess(true);
    } catch (error) {
      setSaveStatus("unsaved");
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Top Navigation Row */}
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/grades")}
            sx={{
              color: "text.secondary",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            Back to My Grades
          </Button>
        </Breadcrumbs>
      </Box>

      {/* Main Header Content */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            {calculationName}
          </Typography>

          {/* Save Status Indicator */}
          {whatIfMode && (
            <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                {saveStatus === "saving" ? (
                  <>
                    <AutorenewIcon
                      sx={{
                        fontSize: 16,
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    <span>Saving changes...</span>
                  </>
                ) : saveStatus === "saved" ? (
                  <>
                    <SaveIcon sx={{ fontSize: 16, color: "success.main" }} />
                    <span>
                      All changes saved{" "}
                      {lastSaved
                        ? `at ${new Date(lastSaved).toLocaleTimeString()}`
                        : ""}
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ color: "#ed6c02" }}>●</span>
                    <span>Unsaved changes</span>
                  </>
                )}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Manual Save Button */}
          {whatIfMode && (
            <Tooltip title="Save changes">
              <Button
                variant="contained"
                onClick={handleSave}
                startIcon={<SaveIcon />}
                disabled={isSaving || saveStatus === "saved"}
                sx={{
                  bgcolor:
                    saveStatus === "unsaved" ? "warning.main" : "primary.main",
                  "&:hover": {
                    bgcolor:
                      saveStatus === "unsaved"
                        ? "warning.dark"
                        : "primary.dark",
                  },
                }}
              >
                {saveStatus === "unsaved" ? "Save Changes" : "Saved"}
              </Button>
            </Tooltip>
          )}

          {/* Duplicate Button */}
          <Tooltip title="Create a copy">
            <Button
              variant="outlined"
              onClick={onDuplicate}
              startIcon={<ContentCopyIcon />}
              disabled={isSaving}
            >
              Duplicate
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Save Success Snackbar */}
      <Snackbar
        open={showSaveSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSaveSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSaveSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Changes saved successfully
        </Alert>
      </Snackbar>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Paper>
  );
};

export default SavedCalculationHeader;
