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
    toggleCourseForMajor,
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
              backgroundColor: isDark ? "#252525" : "white",
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
                sx={{ fontSize: 32, color: "primary.main", opacity: 0.8 }}
              />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                  GPA Calculator
                </Typography>
                {isEditing && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Chip 
                      label="Editing Your GPA" 
                      color="primary" 
                      size="small" 
                      icon={<EditIcon />}
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              {isEditing && (
                <Button
                  startIcon={<CancelIcon />}
                  variant="outlined"
                  color="error"
                  onClick={handleCancelEditing}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    boxShadow: 2,
                    "&:hover": {
                      boxShadow: 4,
                    },
                  }}
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                startIcon={isSaving ? null : <SaveIcon />}
                variant="contained"
                color="secondary"
                onClick={handleSaveGPA}
                disabled={isSaving}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  boxShadow: 2,
                  "&:hover": {
                    boxShadow: 4,
                  },
                }}
              >
                {isSaving ? 'Saving...' : 'Save GPA'}
              </Button>
            </Box>
          </Box>

          <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Courses
              </Typography>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() => addCourseContext()}
                sx={{
                  borderRadius: 2,
                  "&:hover": {
                    boxShadow: 1,
                  },
                }}
              >
                Add Course
              </Button>
            </Box>
            
            {courses.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Add courses to calculate your GPA
              </Typography>
            ) : (
              renderCourseInputs(courses)
            )}

            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
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
                
                {courses.filter(c => c.isForMajor).length > 0 && (
                  <Chip 
                    label={`${courses.filter(c => c.isForMajor).length} courses`}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </>
  );
};

export default GPACalculator; 