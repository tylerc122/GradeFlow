/**
 * The grade input screen, either manual or blackboard.
 */
import React from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Stack,
  keyframes,
  useTheme as useMuiTheme,
  alpha,
} from "@mui/material";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import EditIcon from "@mui/icons-material/Edit";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BlackboardInput from "./BlackboardInput";
import ManualInput from "./ManualInput";
import { useTheme } from "../../src/contexts/ThemeContext";

// Create a subtle pulse animation for the recommended badge
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Create a subtle glow animation for the button border
const glowAnimation = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(25, 118, 210, 0.2), 0 0 10px rgba(25, 118, 210, 0.1);
  }
  50% {
    box-shadow: 0 0 10px rgba(25, 118, 210, 0.3), 0 0 20px rgba(25, 118, 210, 0.2);
  }
  100% {
    box-shadow: 0 0 5px rgba(25, 118, 210, 0.2), 0 0 10px rgba(25, 118, 210, 0.1);
  }
`;

const GradeInput = ({
  mode,
  setMode,
  rawGradeData,
  setRawGradeData,
  categories,
  setGrades,
  manualGrades,
}) => {
  const muiTheme = useMuiTheme();
  const { isDark } = useTheme();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        mb: 3,
        borderRadius: 3,
        background: isDark
          ? "linear-gradient(145deg, #1e1e1e 0%, #252525 100%)"
          : "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
      }}
    >
      <Stack spacing={4}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {mode === "blackboard" ? (
            <ContentPasteIcon
              sx={{ fontSize: 32, color: "primary.main", opacity: 0.8 }}
            />
          ) : (
            <EditIcon
              sx={{ fontSize: 32, color: "primary.main", opacity: 0.8 }}
            />
          )}
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            Input Grades
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant={mode === "manual" ? "contained" : "outlined"}
            onClick={() => setMode("manual")}
            className="grade-input-button"
            sx={{
              flex: 1,
              py: 2,
              transition: "all 0.3s ease",
              backgroundColor:
                mode === "manual"
                  ? undefined // Let MUI handle contained button background
                  : isDark
                  ? "#252525"
                  : undefined,
              "&:hover": {
                transform: "translateY(-2px)",
                backgroundColor:
                  mode === "manual"
                    ? undefined // Let MUI handle contained button hover
                    : isDark
                    ? alpha(muiTheme.palette.primary.main, 0.08)
                    : undefined,
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EditIcon sx={{ fontSize: 20 }} />
              Manual Input
            </Box>
          </Button>

          <Button
            variant={mode === "blackboard" ? "contained" : "outlined"}
            onClick={() => setMode("blackboard")}
            className="grade-input-button"
            sx={{
              flex: 1,
              py: 2,
              position: "relative",
              transition: "all 0.3s ease",
              backgroundColor:
                mode === "blackboard"
                  ? undefined // Let MUI handle contained button background
                  : isDark
                  ? "#252525"
                  : undefined,
              ...(mode === "blackboard" && {
                animation: `${glowAnimation} 2s infinite ease-in-out`,
                background: isDark
                  ? "linear-gradient(45deg, #5361c9 30%, #7581d6 90%)"
                  : "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                "&:hover": {
                  background: isDark
                    ? "linear-gradient(45deg, #7581d6 30%, #9fa8da 90%)"
                    : "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                },
              }),
              "&:hover": {
                transform: "translateY(-2px)",
                backgroundColor:
                  mode === "blackboard"
                    ? undefined // Let MUI handle contained button hover
                    : isDark
                    ? alpha(muiTheme.palette.primary.main, 0.08)
                    : undefined,
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                borderRadius: "9px",
                background: "linear-gradient(45deg, #2196f3, #90caf9)",
                zIndex: -1,
                transition: "opacity 0.3s ease",
                opacity: mode === "blackboard" ? 0.5 : 0,
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ContentPasteIcon sx={{ fontSize: 20 }} />
              Blackboard Import
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  ml: 1,
                  backgroundColor: "success.main",
                  color: "white",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  animation: `${pulseAnimation} 2s infinite ease-in-out`,
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                Recommended
              </Box>
            </Box>
          </Button>
        </Box>

        {mode === "blackboard" ? (
          <BlackboardInput
            rawGradeData={rawGradeData}
            setRawGradeData={setRawGradeData}
          />
        ) : (
          <ManualInput 
            categories={categories} 
            setGrades={setGrades} 
            manualGrades={manualGrades}
          />
        )}
      </Stack>
    </Paper>
  );
};

export default GradeInput;
