import React from "react";
import {
  Paper,
  Typography,
  Alert,
  TextField,
  Box,
  Stack,
  alpha,
} from "@mui/material";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";

const GradeInput = ({ rawGradeData, setRawGradeData }) => {
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
            alignItems: "center",
            gap: 2,
          }}
        >
          <ContentPasteIcon
            sx={{ fontSize: 32, color: "primary.main", opacity: 0.8 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            Input Blackboard Grades
          </Typography>
        </Box>

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
          Copy and paste your grades directly from Blackboard's grade center.
          The system will automatically parse and categorize your assignments.
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
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
                borderWidth: "1px",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
                borderWidth: "2px",
              },
            },
          }}
        />

        {rawGradeData && (
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
    </Paper>
  );
};

export default GradeInput;
