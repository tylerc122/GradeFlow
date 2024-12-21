import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button,
} from "@mui/material";

export const EditScoreDialog = ({
  open,
  onClose,
  onSave,
  assignment,
  categoryName,
}) => {
  const [score, setScore] = useState("");

  useEffect(() => {
    if (open && assignment) {
      setScore(assignment.score?.toString() || "");
    }
  }, [open, assignment]);

  const handleSubmit = () => {
    if (!score) return;
    onSave({
      ...assignment,
      score: parseFloat(score),
      categoryName,
      isHypothetical: true,
    });
    setScore("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setScore("");
        onClose();
      }}
    >
      <DialogTitle>Edit Score</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Score"
          type="number"
          fullWidth
          value={score}
          onChange={(e) => setScore(e.target.value)}
          InputProps={{
            inputProps: { min: 0, max: assignment?.total_points || 100 },
          }}
        />
        <Typography variant="caption" color="text.secondary">
          Maximum points: {assignment?.total_points}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setScore("");
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};
