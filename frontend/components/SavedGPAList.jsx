import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Tooltip,
  Card,
  CardContent,
  Grid,
  alpha,
  useTheme as useMuiTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SavedIcon from "@mui/icons-material/SavedSearch";
import SchoolIcon from "@mui/icons-material/School";
import ComputerIcon from "@mui/icons-material/Computer";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTheme } from "../src/contexts/ThemeContext";
import { useGPA } from "../src/contexts/GPAContext";

const SavedGPAList = () => {
  const muiTheme = useMuiTheme();
  const { mode, isDark } = useTheme();
  const { savedGPAs, setSavedGPAs, editSavedGPA, duplicateGPA } = useGPA();
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gpaToDelete, setGpaToDelete] = useState(null);
  
  // State for menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeGPA, setActiveGPA] = useState(null);

  const handleOpenMenu = (event, gpa) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveGPA(gpa);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActiveGPA(null);
  };

  const handleDeleteClick = (gpa) => {
    handleCloseMenu();
    setGpaToDelete(gpa);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (gpaToDelete) {
      setSavedGPAs(savedGPAs.filter((gpa) => gpa.id !== gpaToDelete.id));
    }
    setDeleteDialogOpen(false);
    setGpaToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setGpaToDelete(null);
  };

  const handleEditSavedGPA = (id) => {
    handleCloseMenu();
    // Scroll to top of page to see the editor
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Load the saved GPA into the editor
    editSavedGPA(id);
  };

  const handleDuplicateGPA = (id) => {
    handleCloseMenu();
    duplicateGPA(id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        mb: 3,
        borderRadius: 3,
        background: isDark
          ? "linear-gradient(145deg, #1e1e1e 0%, #252525 100%)"
          : "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <SavedIcon
          sx={{ fontSize: 32, color: "primary.main", opacity: 0.8 }}
        />
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          Saved GPA Calculations
        </Typography>
      </Box>

      {savedGPAs.length === 0 ? (
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)",
            textAlign: "center",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No saved GPA calculations yet. Calculate and save your GPA to see it here.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {savedGPAs.map((savedGPA) => (
            <Grid item xs={12} md={6} key={savedGPA.id}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isDark ? "#252525" : "white",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: 4,
                  },
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {savedGPA.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                        {formatDate(savedGPA.date)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, savedGPA)}
                        sx={{
                          color: "text.secondary",
                          "&:hover": {
                            backgroundColor: alpha(muiTheme.palette.primary.main, 0.08),
                          },
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SchoolIcon color="success" fontSize="small" />
                      <Typography variant="body2">Overall GPA:</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "success.main" }}>
                      {savedGPA.overallGPA}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ComputerIcon color="primary" fontSize="small" />
                      <Typography variant="body2">Technical GPA:</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "primary.main" }}>
                      {savedGPA.technicalGPA}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      size="small"
                      onClick={() => handleDuplicateGPA(savedGPA.id)}
                      sx={{ 
                        borderRadius: 2,
                        "&:hover": {
                          boxShadow: 1,
                        }
                      }}
                    >
                      Duplicate
                    </Button>
                    <Button 
                      variant="outlined"
                      startIcon={<EditIcon />}
                      size="small"
                      onClick={() => handleEditSavedGPA(savedGPA.id)}
                      sx={{ 
                        borderRadius: 2,
                        "&:hover": {
                          boxShadow: 1,
                        }
                      }}
                    >
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete GPA Calculation
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{gpaToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* GPA Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 200,
            borderRadius: 2,
            overflow: 'visible',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => activeGPA && handleEditSavedGPA(activeGPA.id)}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        <MenuItem onClick={() => activeGPA && handleDuplicateGPA(activeGPA.id)}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" color="secondary" />
          </ListItemIcon>
          <ListItemText primary="Duplicate" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => activeGPA && handleDeleteClick(activeGPA)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete" sx={{ color: 'error.main' }} />
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default SavedGPAList; 