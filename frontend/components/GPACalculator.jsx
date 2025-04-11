import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
  useTheme as useMuiTheme,
  Chip,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import SchoolIcon from "@mui/icons-material/School";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LoginIcon from '@mui/icons-material/Login';
import { useTheme } from "../src/contexts/ThemeContext";
import { useGPA } from "../src/contexts/GPAContext";
import { useAuth } from "../src/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import GPASaveConflictModal from "./dialogs/GPASaveConflictDialog";

const GPACalculator = () => {
  const muiTheme = useMuiTheme();
  const { mode, isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { 
    courses, 
    setCourses, 
    centralGPA,
    calculateOverallGPA,
    calculateMajorGPA,
    updateCentralGPA,
    isEditing,
    setIsEditing,
    cancelEditing,
    editGPA,
    toggleCourseForMajor,
    toggleCourseVisibility,
    addCourse: addCourseContext,
    currentGPAId,
    stashDataBeforeLogin,
    conflictStatus,
    resolveConflictKeepSaved,
    resolveConflictReplaceSaved
  } = useGPA();

  const [isSaving, setIsSaving] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);

  useEffect(() => {
    if (conflictStatus === 'conflict') {
      setShowConflictModal(true);
    } else {
      setShowConflictModal(false);
    }
  }, [conflictStatus]);

  const letterGrades = [
    "A+", "A", "A-", 
    "B+", "B", "B-", 
    "C+", "C", "C-", 
    "D+", "D", "D-", 
    "F"
  ];

  const handleCourseChange = (index, field, value) => {
    if (field === "credits") {
      value = value.replace(/[^\d.]/g, "");
      
      const decimalCount = (value.match(/\./g) || []).length;
      if (decimalCount > 1) {
        value = value.replace(/\./g, (match, idx) => 
          idx === value.indexOf(".") ? match : ""
        );
      }
    }

    const updatedCourses = [...courses];
    
    if (updatedCourses[index]) {
        updatedCourses[index][field] = value;
        setCourses(updatedCourses);
    }
  };

  const deleteCourse = (index) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const handleSaveGPA = async () => {
    setIsSaving(true);
    try {
      await updateCentralGPA("My GPA");
    } catch (error) { 
      console.error("Save failed in component");
    } finally {
       setIsSaving(false);
    }
  };

  const handleLoginToSave = () => {
    stashDataBeforeLogin();
    navigate('/login');
  };

  const handleCancelEditing = () => {
    cancelEditing();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleModalResolve = async (action) => {
    setShowConflictModal(false);
    if (action === 'keep') {
      await resolveConflictKeepSaved();
    } else if (action === 'replace') {
      await resolveConflictReplaceSaved();
    }
  };

  const renderCourseInputs = (courseList) => {
    return (
      <Stack spacing={2}>
        {courseList.map((course, index) => (
          <Paper
            key={course.id || index}
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              transition: "all 0.2s ease-in-out",
              backgroundColor: course.isHidden 
                ? alpha(isDark ? "#252525" : "white", 0.5) 
                : isDark ? "#252525" : "white",
              opacity: course.isHidden ? 0.7 : 1,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 2,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexWrap: {xs: 'wrap', md: 'nowrap'},
              }}
            >
              <TextField
                size="medium"
                label="Course Title"
                value={course.title}
                onChange={(e) => handleCourseChange(index, "title", e.target.value)}
                sx={{
                  flexGrow: 1,
                  minWidth: {xs: '100%', md: 'auto'},
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                size="medium"
                label="Credits"
                value={course.credits}
                onChange={(e) => handleCourseChange(index, "credits", e.target.value)}
                sx={{
                  width: {xs: '45%', md: '100px'},
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <FormControl
                sx={{
                  width: {xs: '45%', md: '100px'},
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              >
                <InputLabel>Grade</InputLabel>
                <Select
                  value={course.grade}
                  label="Grade"
                  onChange={(e) => handleCourseChange(index, "grade", e.target.value)}
                >
                  {letterGrades.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Include in Major GPA">
                <Chip
                  label="Major"
                  color={course.isForMajor ? "primary" : "default"}
                  variant={course.isForMajor ? "filled" : "outlined"}
                  onClick={() => toggleCourseForMajor(index)}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                />
              </Tooltip>
              <Tooltip title={course.isHidden ? "Show Course" : "Hide Course"}>
                <IconButton
                  onClick={() => toggleCourseVisibility(index)}
                  size="small"
                  sx={{
                    bgcolor: alpha(
                      course.isHidden 
                        ? muiTheme.palette.warning.main 
                        : muiTheme.palette.primary.main,
                      0.1
                    ),
                    color: course.isHidden
                      ? muiTheme.palette.warning.main
                      : muiTheme.palette.primary.main,
                    "&:hover": {
                      bgcolor: alpha(
                        course.isHidden
                          ? muiTheme.palette.warning.main
                          : muiTheme.palette.primary.main,
                        0.2
                      ),
                    },
                  }}
                >
                  {course.isHidden ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <IconButton
                onClick={() => deleteCourse(index)}
                sx={{
                  color: "error.main",
                  "&:hover": {
                    backgroundColor: alpha("#f44336", 0.08),
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Stack>
    );
  };

  return (
    <>
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
        <Stack spacing={3}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: {xs: 'wrap', md: 'nowrap'},
              gap: 2
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <SchoolIcon
                fontSize="large"
                color="primary"
              />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                GPA Calculator
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              {isEditing ? (
                <>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEditing}
                    sx={{ borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                  {isAuthenticated ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveGPA}
                      disabled={isSaving}
                      sx={{ borderRadius: 2 }}
                    >
                      {isSaving ? "Saving..." : (currentGPAId ? "Update GPA" : "Save GPA")}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<LoginIcon />}
                      onClick={handleLoginToSave}
                      sx={{ borderRadius: 2 }}
                    >
                      Login to Save
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    if (currentGPAId) {
                       editGPA();
                    } else {
                       setIsEditing(true); 
                    }
                  }}
                  sx={{ borderRadius: 2 }}
                  disabled={conflictStatus === 'conflict' || conflictStatus === 'pending'}
                >
                  {currentGPAId ? "Edit Saved GPA" : "Create New GPA"}
                </Button>
              )}
            </Box>
          </Box>

          {conflictStatus === 'pending' && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', my: 2}}>
              Checking for saved data...
            </Typography>
          )}

          {isEditing ? (
            <>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Your Courses</Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ ml: 2 }}
                >
                  {courses.filter(c => !c.isHidden).length} visible courses,{" "}
                  {courses.filter(c => c.isHidden).length} hidden
                </Typography>
              </Box>

              {renderCourseInputs(courses)}

              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => addCourseContext()}
                  sx={{
                    borderRadius: 6,
                    px: 3,
                    py: 1,
                    borderStyle: "dashed",
                    borderWidth: 2,
                  }}
                >
                  Add Course
                </Button>
              </Box>

              <Stack 
                direction={{ xs: "column", sm: "row" }} 
                spacing={2} 
                sx={{ mt: 3 }}
              >
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: alpha(
                      "#4caf50",
                      isDark ? 0.15 : 0.08
                    ),
                    border: "1px solid",
                    borderColor: alpha(
                      "#4caf50",
                      isDark ? 0.3 : 0.2
                    ),
                    flex: 1
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: "success.main",
                    }}
                  >
                    Overall GPA: {calculateOverallGPA()}
                  </Typography>
                </Box>
                
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: alpha(
                      "#3f51b5",
                      isDark ? 0.15 : 0.08
                    ),
                    border: "1px solid",
                    borderColor: alpha(
                      "#3f51b5",
                      isDark ? 0.3 : 0.2
                    ),
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                    }}
                  >
                    Major GPA: {calculateMajorGPA()}
                  </Typography>
                  
                  {courses.filter(c => c.isForMajor && !c.isHidden).length > 0 && (
                    <Chip 
                      label={`${courses.filter(c => c.isForMajor && !c.isHidden).length} courses`}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 500 }}
                    />
                  )}
                </Box>
              </Stack>
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                {isAuthenticated 
                  ? (currentGPAId ? `Loaded GPA: ${centralGPA.name || 'My GPA'}. Click 'Edit Saved GPA' to modify.` : "Click 'Create New GPA' to start.")
                  : "Click 'Create New GPA' to start calculating. Login to save your progress."
                }
              </Typography>
              {!isAuthenticated && !isEditing && (
                <Button 
                  variant="outlined"
                  onClick={() => setIsEditing(true)} 
                  sx={{ mt: 2 }}
                >
                  Start Calculating (Unsaved)
                </Button>
              )}
            </Box>
          )}
        </Stack>
      </Paper>

      <GPASaveConflictModal
        open={showConflictModal}
        onClose={() => handleModalResolve('keep')}
        onKeepSaved={() => handleModalResolve('keep')}
        onReplaceSaved={() => handleModalResolve('replace')}
      />
    </>
  );
};

export default GPACalculator; 