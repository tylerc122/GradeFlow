import React from "react";
import { Paper, Typography, Box, TextField, Button } from "@mui/material";

export const GradeSummary = ({
  weightedGrade,
  whatIfMode,
  setWhatIfMode,
  targetGrade,
  setTargetGrade,
}) => (
  <Paper sx={{ p: 3, mb: 3 }}>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Typography variant="h4" color="primary">
        Current Grade: {weightedGrade.toFixed(2)}%
      </Typography>
      <Button
        variant="contained"
        color={whatIfMode ? "secondary" : "primary"}
        onClick={() => setWhatIfMode(!whatIfMode)}
      >
        {whatIfMode ? "Exit What-If Mode" : "Enter What-If Mode"}
      </Button>
    </Box>

    {whatIfMode && (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          What-If Analysis
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Target Grade"
            type="number"
            value={targetGrade}
            onChange={(e) => setTargetGrade(e.target.value)}
            InputProps={{
              endAdornment: "%",
            }}
            sx={{ width: 150 }}
          />
          <Button variant="outlined">Calculate Needed Scores</Button>
        </Box>
      </Box>
    )}
  </Paper>
);
