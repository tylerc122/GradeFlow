import React from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { AutoGraph, Calculate } from "@mui/icons-material";

export const GradeSummary = ({
  weightedGrade,
  whatIfMode,
  setWhatIfMode,
  targetGrade,
  setTargetGrade,
}) => {
  const getGradeColor = (grade) => {
    if (grade >= 90) return "#4caf50";
    if (grade >= 80) return "#2196f3";
    if (grade >= 70) return "#ff9800";
    return "#f44336";
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        mb: 3,
        borderRadius: 3,
        background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
      }}
    >
      <Stack spacing={3}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              Current Grade
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 600,
                color: getGradeColor(weightedGrade),
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {weightedGrade.toFixed(2)}%
              <AutoGraph sx={{ fontSize: 32, opacity: 0.8 }} />
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<Calculate />}
            onClick={() => setWhatIfMode(!whatIfMode)}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              backgroundColor: whatIfMode ? "#ef5350" : "#1976d2",
              "&:hover": {
                backgroundColor: whatIfMode ? "#d32f2f" : "#1565c0",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            {whatIfMode ? "Exit What-If Mode" : "Enter What-If Mode"}
          </Button>
        </Box>

        {whatIfMode && (
          <Box
            sx={{
              p: 3,
              bgcolor: "rgba(25, 118, 210, 0.08)",
              borderRadius: 2,
              border: "1px solid rgba(25, 118, 210, 0.2)",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: "primary.main", fontWeight: 500 }}
            >
              What-If Analysis
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                label="Target Grade"
                type="number"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                InputProps={{
                  endAdornment: "%",
                  sx: { borderRadius: 1.5 },
                }}
                sx={{
                  width: 150,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(25, 118, 210, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "primary.main",
                    },
                  },
                }}
              />
              <Button
                variant="outlined"
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  px: 3,
                }}
              >
                Calculate Needed Scores
              </Button>
            </Box>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};
