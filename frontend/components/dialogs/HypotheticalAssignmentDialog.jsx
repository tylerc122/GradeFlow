import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
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

  const handleSubmit = () => {
    if (!assignmentName || !score || !totalPoints) return;
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
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Hypothetical Assignment</DialogTitle>
      <DialogContent>
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
