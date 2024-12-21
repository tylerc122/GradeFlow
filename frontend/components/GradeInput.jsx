import React from "react";
import { Paper, Typography, Alert, TextField } from "@mui/material";

const GradeInput = ({ rawGradeData, setRawGradeData }) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Input Blackboard Grades
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Copy and paste your grades directly from Blackboard's grade center.
      </Alert>
      <TextField
        multiline
        fullWidth
        rows={10}
        value={rawGradeData}
        onChange={(e) => setRawGradeData(e.target.value)}
        placeholder="Paste your grades here..."
        variant="outlined"
      />
    </Paper>
  );
};

export default GradeInput;
