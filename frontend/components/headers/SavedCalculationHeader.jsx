import React from "react";
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
  onNavigateBack,
}) => {
  const navigate = useNavigate();
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false);

  const handleBackClick = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      navigate("/grades");
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, sm: 3 },
        pl: { xs: 2, sm: 2 },
        mb: 3,
        borderRadius: 2,
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Top Navigation Row */}
      <Box sx={{ mb: 3, ml: -0.5 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{
            color: "text.secondary",
            paddingLeft: 2,
            paddingRight: 2,
            paddingTop: 0.5,
            paddingBottom: 0,
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          Back to My Grades
        </Button>
      </Box>

      {/* Main Header Content */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pl: 1.5,
          mt: 2,
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
          {/* Save Button - Only visible when there are unsaved changes */}
          {whatIfMode && saveStatus === "unsaved" && (
            <Button
              variant="contained"
              onClick={onSave}
              startIcon={<SaveIcon />}
              disabled={isSaving}
              color="primary"
              sx={{
                fontWeight: 600,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                },
              }}
            >
              Save Changes
            </Button>
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
