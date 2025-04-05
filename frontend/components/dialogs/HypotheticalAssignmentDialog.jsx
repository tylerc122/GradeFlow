import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from "@mui/material";

export const HypotheticalAssignmentDialog = ({
  open,
  onClose,
  onAdd,
  categoryName,
}) => {
  const [assignmentName, setAssignmentName] = useState("");
  const [score, setScore] = useState("");
  const [totalPoints, setTotalPoints] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!assignmentName || !score || !totalPoints) {
      setError("All fields are required to continue!");
      return;
    }
    onAdd({
      name: assignmentName,
      score: parseFloat(score),
      total_points: parseFloat(totalPoints),
      status: "HYPOTHETICAL",
      categoryName,
    });
    onClose();
    setAssignmentName("");
    setScore("");
    setTotalPoints("");
    setError("");
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: "background.default",
          borderRadius: "16px",
        }
      }}
    >
      <DialogTitle>Add Hypothetical Assignment</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3, width: "100%" }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Assignment Name"
          fullWidth
          value={assignmentName}
          onChange={(e) => setAssignmentName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Score"
          type="number"
          fullWidth
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Total Points"
          type="number"
          fullWidth
          value={totalPoints}
          onChange={(e) => setTotalPoints(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Add</Button>
      </DialogActions>
    </Dialog>
  );
};
