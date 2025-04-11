/**
 * Dialog that appears when user tries to save GPA while logged out.
 * Allows user to keep saved GPA or replace it with new data.
 */
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

const GPASaveConflictModal = ({ open, onClose, onKeepSaved, onReplaceSaved }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose} // Closes the dialog if clicking outside or pressing Esc
      aria-labelledby="gpa-conflict-dialog-title"
      aria-describedby="gpa-conflict-dialog-description"
    >
      <DialogTitle id="gpa-conflict-dialog-title">
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
           Resolve Save Conflict
        </Typography>
       </DialogTitle>
      <DialogContent dividers>
        <DialogContentText id="gpa-conflict-dialog-description">
          You entered GPA data while logged out, but your account already has a saved GPA calculation.
        </DialogContentText>
        <DialogContentText sx={{ mt: 2 }}>
          How would you like to proceed?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onKeepSaved} color="secondary" variant="outlined" sx={{ borderRadius: 2, mr: 1 }}>
          Discard New Data & Keep Saved GPA
        </Button>
        <Button onClick={onReplaceSaved} color="primary" variant="contained" autoFocus sx={{ borderRadius: 2 }}>
          Replace Saved GPA with New Data
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GPASaveConflictModal; 