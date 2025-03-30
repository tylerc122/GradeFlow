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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  alpha,
  useTheme as useMuiTheme,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import SchoolIcon from "@mui/icons-material/School";
import ComputerIcon from "@mui/icons-material/Computer";
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
    cancelEditing
  } = useGPA();

  const [tabValue, setTabValue] = useState(0);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState(centralGPA.name || "My GPA");

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
      setSaveName(centralGPA.name);
    }
  }, [isEditing, centralGPA.name]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const addCourse = (isMajor = false) => {
    const newCourse = { title: "", credits: "", grade: "A" };
    if (isMajor) {
      setMajorCourses([...majorCourses, newCourse]);
    } else {
      setCourses([...courses, newCourse]);
    }
  };

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

  const handleOpenSaveDialog = () => {
    setSaveDialogOpen(true);
  };

  const handleSaveGPA = () => {
    if (saveName.trim()) {
      updateCentralGPA(saveName);
      setSaveDialogOpen(false);
    }
  };

  const handleCancelEditing = () => {
    cancelEditing();
    setSaveName(centralGPA.name);
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
                startIcon={<SaveIcon />}
                variant="contained"
                color="secondary"
                onClick={handleOpenSaveDialog}
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
                Save GPA
              </Button>
            </Box>
          </Box>

          <Box sx={{ width: '100%', mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                }
              }}
            >
              <Tab
                icon={<SchoolIcon />}
                iconPosition="start"
                label="Overall GPA" 
                id="tab-0"
                aria-controls="tabpanel-0"
              />
              <Tab
                icon={<ComputerIcon />}
                iconPosition="start"
                label="Major GPA" 
                id="tab-1" 
                aria-controls="tabpanel-1"
              />
            </Tabs>
          </Box>

          <Box role="tabpanel" hidden={tabValue !== 0} id="tabpanel-0" aria-labelledby="tab-0">
            {tabValue === 0 && (
              <>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Regular Courses
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    onClick={() => addCourse()}
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
                    Add courses to calculate your overall GPA
                  </Typography>
                ) : (
                  renderCourseInputs(courses)
                )}

                <Box
                  sx={{
                    mt: 3,
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
              </>
            )}
          </Box>

          <Box role="tabpanel" hidden={tabValue !== 1} id="tabpanel-1" aria-labelledby="tab-1">
            {tabValue === 1 && (
              <>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Major Courses
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    onClick={() => addCourse(true)}
                    sx={{
                      borderRadius: 2,
                      "&:hover": {
                        boxShadow: 1,
                      },
                    }}
                  >
                    Add Major Course
                  </Button>
                </Box>
                
                {majorCourses.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Add major courses to calculate your major GPA
                  </Typography>
                ) : (
                  renderCourseInputs(majorCourses, true)
                )}

                <Box
                  sx={{
                    mt: 3,
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
                </Box>
              </>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save GPA Calculation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name your GPA"
            type="text"
            fullWidth
            variant="outlined"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            sx={{ mt: 1 }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              Overall GPA: {calculateOverallGPA()}
            </Typography>
            <Typography variant="body2">
              Major GPA: {calculateMajorGPA()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveGPA} 
            variant="contained"
            disabled={!saveName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GPACalculator; 