import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

const SaveCalculationDialog = ({
  open,
  onClose,
  onSave,
  calculationData,
  loading = false,
  error = null,
  title = "Save Calculation",
  defaultName = "",
}) => {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (open) {
      setName(defaultName);
    }
  }, [open, defaultName]);

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      await onSave({
        name,
        ...calculationData,
      });
      setName("");
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            label="Calculation Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            helperText="Give your calculation a memorable name"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!name.trim() || loading}
          startIcon={<SaveIcon />}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveCalculationDialog;
