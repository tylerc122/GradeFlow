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
import { useTheme } from "../src/contexts/ThemeContext";
import { useGPA } from "../src/contexts/GPAContext";

const GPACalculator = () => {
  const muiTheme = useMuiTheme();
  const { mode, isDark } = useTheme();
  const { 
    courses, 
    setCourses, 
    majorCourses, 
    setMajorCourses,
    centralGPA,
    calculateOverallGPA,
    calculateMajorGPA,
    updateCentralGPA,
    isEditing,
    cancelEditing,
    editGPA,
    toggleCourseForMajor,
    toggleCourseVisibility,
    addCourse: addCourseContext
  } = useGPA();

  const [isSaving, setIsSaving] = useState(false);

  // Letter grades for dropdown
  const letterGrades = [
    "A+", "A", "A-", 
    "B+", "B", "B-", 
    "C+", "C", "C-", 
    "D+", "D", "D-", 
    "F"
  ];

  // Set initial save name when editing
  useEffect(() => {
    if (isEditing) {
      // No need to set save name anymore
    }
  }, [isEditing]);

  const handleCourseChange = (index, field, value, isMajor = false) => {
    if (field === "credits") {
      // Ensure credits are numeric
      value = value.replace(/[^\d.]/g, "");
      
      // Enforce one decimal point
      const decimalCount = (value.match(/\./g) || []).length;
      if (decimalCount > 1) {
        value = value.replace(/\./g, (match, idx) => 
          idx === value.indexOf(".") ? match : ""
        );
      }
    }

    const updatedCourses = isMajor 
      ? [...majorCourses]
      : [...courses];
    
    updatedCourses[index][field] = value;
    
    if (isMajor) {
      setMajorCourses(updatedCourses);
    } else {
      setCourses(updatedCourses);
    }
  };

  const deleteCourse = (index, isMajor = false) => {
    if (isMajor) {
      setMajorCourses(majorCourses.filter((_, i) => i !== index));
    } else {
      setCourses(courses.filter((_, i) => i !== index));
    }
  };

  const handleSaveGPA = async () => {
    setIsSaving(true);
    await updateCentralGPA("My GPA"); // Use default name
    setIsSaving(false);
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

  const renderCourseInputs = (courseList, isMajor = false) => {
    return (
      <Stack spacing={2}>
        {courseList.map((course, index) => (
          <Paper
            key={index}
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
                onChange={(e) => handleCourseChange(index, "title", e.target.value, isMajor)}
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
                onChange={(e) => handleCourseChange(index, "credits", e.target.value, isMajor)}
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
                  onChange={(e) => handleCourseChange(index, "grade", e.target.value, isMajor)}
                >
                  {letterGrades.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {!isMajor && (
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
              )}
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
                onClick={() => deleteCourse(index, isMajor)}
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
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveGPA}
                    disabled={isSaving}
                    sx={{ borderRadius: 2 }}
                  >
                    {isSaving ? "Saving..." : "Save GPA"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    // If we have a centralGPA with courses, we'll use those, otherwise nothing to edit
                    if (!centralGPA.id) {
                      // No GPA to edit, just switch to editing mode
                      setIsEditing(true);
                    } else {
                      // Use the edit function from context
                      editGPA();
                    }
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  {centralGPA.id ? "Edit GPA" : "Create GPA"}
                </Button>
              )}
            </Box>
          </Box>

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
                Click "Edit GPA" to start calculating your grade point average
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </>
  );
};

export default GPACalculator; 