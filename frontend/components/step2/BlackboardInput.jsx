import React from "react";
import {
  Box,
  Typography,
  Alert,
  TextField,
  Stack,
  alpha,
  useTheme as useMuiTheme,
} from "@mui/material";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { useTheme } from "../../src/contexts/ThemeContext";

const BlackboardInput = ({ rawGradeData, setRawGradeData }) => {
  const muiTheme = useMuiTheme();
  const { mode } = useTheme();

  const isValidFormat = (data) => {
    if (!data.trim()) return false;
    const lines = data.split("\n").filter((line) => line.trim());
    if (lines.length < 4) return false;
    const hasScore = data.includes("/");
    const hasStatus = data.includes("GRADED") || data.includes("UPCOMING");
    return hasScore && hasStatus;
  };

  return (
    <Stack spacing={3}>
      <Alert
        severity="info"
        sx={{
          backgroundColor: alpha("#2196f3", mode === "dark" ? 0.15 : 0.08),
          border: "1px solid",
          borderColor: alpha("#2196f3", mode === "dark" ? 0.3 : 0.2),
          "& .MuiAlert-icon": {
            color: mode === "dark" ? "#90caf9" : "primary.main",
          },
        }}
      >
        Copy and paste your grades directly from Blackboard's grade center. The
        system will automatically parse and categorize your assignments.
      </Alert>

      <TextField
        multiline
        fullWidth
        rows={12}
        value={rawGradeData}
        onChange={(e) => setRawGradeData(e.target.value)}
        placeholder="Paste your grades here..."
        variant="outlined"
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: mode === "dark" ? "#252525" : "#fff",
            borderRadius: 2,
            "& textarea": {
              backgroundColor: mode === "dark" ? "#252525" : "#fff",
              color: mode === "dark" ? "rgba(255, 255, 255, 0.9)" : "inherit",
            },
          },
        }}
      />

      {rawGradeData && isValidFormat(rawGradeData) && (
        <Alert
          severity="success"
          sx={{
            backgroundColor: alpha("#4caf50", mode === "dark" ? 0.15 : 0.08),
            border: "1px solid",
            borderColor: alpha("#4caf50", mode === "dark" ? 0.3 : 0.2),
          }}
        >
          Grade data detected! Click "Next" to proceed with the analysis.
        </Alert>
      )}
    </Stack>
  );
};

export default BlackboardInput;
