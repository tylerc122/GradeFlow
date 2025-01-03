import React from "react";
import { Box, Typography, Alert, TextField, Stack, alpha } from "@mui/material";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";

const BlackboardInput = ({ rawGradeData, setRawGradeData }) => {
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
          backgroundColor: alpha("#2196f3", 0.08),
          border: "1px solid",
          borderColor: alpha("#2196f3", 0.2),
          "& .MuiAlert-icon": {
            color: "primary.main",
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
            backgroundColor: "#fff",
            borderRadius: 2,
          },
        }}
      />

      {rawGradeData && isValidFormat(rawGradeData) && (
        <Alert
          severity="success"
          sx={{
            backgroundColor: alpha("#4caf50", 0.08),
            border: "1px solid",
            borderColor: alpha("#4caf50", 0.2),
          }}
        >
          Grade data detected! Click "Next" to proceed with the analysis.
        </Alert>
      )}
    </Stack>
  );
};

export default BlackboardInput;
