import React, { createContext, useContext, useState, useEffect } from "react";

const GPAContext = createContext();

export const GPAProvider = ({ children }) => {
  // GPA courses data
  const [courses, setCourses] = useState([]);
  const [majorCourses, setMajorCourses] = useState([]);
  
  // Central GPA data
  const [centralGPA, setCentralGPA] = useState({
    name: "My GPA",
    lastUpdated: new Date().toISOString(),
    overallGPA: "0.00",
    majorGPA: "0.00"
  });

  // Saved GPAs
  const [savedGPAs, setSavedGPAs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGPAId, setCurrentGPAId] = useState(null);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);

  // Load saved data from backend and localStorage on mount
  useEffect(() => {
    fetchSavedGPAs();
    loadLocalStorageData();
  }, []);

  // Save to localStorage whenever courses or majorCourses change
  useEffect(() => {
    if (courses.length > 0 || majorCourses.length > 0) {
      const localData = {
        courses,
        majorCourses,
        centralGPA,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('gpaCalculatorData', JSON.stringify(localData));
    }
  }, [courses, majorCourses, centralGPA]);

  // Load data from localStorage
  const loadLocalStorageData = () => {
    try {
      const savedData = localStorage.getItem('gpaCalculatorData');
      if (savedData) {
        const { courses: savedCourses, majorCourses: savedMajorCourses, centralGPA: savedCentralGPA } = JSON.parse(savedData);
        
        // Only load if there's actual data
        if (savedCourses?.length > 0 || savedMajorCourses?.length > 0) {
          setCourses(savedCourses || []);
          setMajorCourses(savedMajorCourses || []);
          setCentralGPA(savedCentralGPA || centralGPA);
          setIsEditing(true); // Set to editing mode when loading unsaved data
        }
      }
    } catch (error) {
      console.error('Error loading GPA data from localStorage:', error);
    }
  };

  // Clear localStorage data when saving to backend
  const clearLocalStorageData = () => {
    localStorage.removeItem('gpaCalculatorData');
  };

  // Fetch all saved GPAs from the backend
  const fetchSavedGPAs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/grades/gpa/saved', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedGPAs(data);
        
        // Load the most recent GPA as the current one if available
        if (data.length > 0) {
          const mostRecent = data.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          )[0];
          
          setCentralGPA({
            id: mostRecent.id,
            name: mostRecent.name,
            lastUpdated: mostRecent.created_at,
            overallGPA: mostRecent.overallGPA,
            majorGPA: mostRecent.majorGPA,
            courses: mostRecent.courses || [],
            majorCourses: mostRecent.majorCourses || []
          });
          setCurrentGPAId(mostRecent.id);
        }
      } else {
        console.error('Failed to load saved GPAs');
      }
    } catch (error) {
      console.error('Error fetching saved GPAs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert letter grade to GPA points
  const letterToGPA = (letter) => {
    const gradeMap = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0
    };
    return gradeMap[letter] || 0;
  };

  // Calculate overall GPA
  const calculateGPA = (courseList) => {
    if (!courseList || courseList.length === 0) return "0.00";
    
    const totalCredits = courseList.reduce((sum, course) => sum + (parseFloat(course.credits) || 0), 0);
    const totalPoints = courseList.reduce((sum, course) => {
      return sum + (parseFloat(course.credits) || 0) * letterToGPA(course.grade);
    }, 0);
    
    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  // Calculate overall and major GPA
  const calculateOverallGPA = () => calculateGPA(courses);
  const calculateMajorGPA = () => {
    // Only use courses marked as for major
    const coursesForMajor = courses.filter(course => course.isForMajor);
    // Check if there are any major courses
    if (coursesForMajor.length === 0) return "0.00";
    return calculateGPA(coursesForMajor);
  };

  // Toggle whether a course is included in major GPA
  const toggleCourseForMajor = (index) => {
    const updatedCourses = [...courses];
    updatedCourses[index] = {
      ...updatedCourses[index],
      isForMajor: !updatedCourses[index]?.isForMajor
    };
    setCourses(updatedCourses);
  };

  // Add new course with isForMajor property initialized to false
  const addCourse = (courseData = {}) => {
    const newCourse = { 
      title: courseData.title || "", 
      credits: courseData.credits || "", 
      grade: courseData.grade || "A",
      isForMajor: courseData.isForMajor || false
    };
    setCourses([...courses, newCourse]);
  };

  // Update the central GPA with current calculations and save to backend
  const updateCentralGPA = async (name = "My GPA") => {
    // Calculate GPAs
    const overallGPA = calculateOverallGPA();
    const majorGPA = calculateMajorGPA();
    
    // Create new GPA object
    const updatedGPA = {
      name: "My GPA", // Always use default name
      lastUpdated: new Date().toISOString(),
      overallGPA,
      majorGPA,
      courses: [...courses],
    };
    
    // Update state
    setCentralGPA(updatedGPA);
    setIsEditing(false);
    
    try {
      // Prepare payload
      const payload = {
        name: "My GPA", // Always use default name
        overallGPA,
        majorGPA,
        courses: [...courses],
      };
      
      // Determine if this is an update or a new GPA
      const url = currentGPAId ? 
        `http://localhost:8000/api/grades/gpa/${currentGPAId}` : 
        'http://localhost:8000/api/grades/gpa/save';
      
      const method = currentGPAId ? 'PUT' : 'POST';
      
      // Save to backend
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (!currentGPAId) {
          setCurrentGPAId(data.id);
          // Update centralGPA with the ID
          setCentralGPA({
            ...updatedGPA,
            id: data.id
          });
        }
        // Clear localStorage data after successful save
        clearLocalStorageData();
        // Refresh saved GPAs
        fetchSavedGPAs();
      } else {
        console.error('Failed to save GPA calculation');
      }
    } catch (error) {
      console.error('Error saving GPA calculation:', error);
    }
  };

  // Load a saved GPA for editing
  const editSavedGPA = async (gpaId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/grades/gpa/${gpaId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentGPAId(data.id);
        setCentralGPA({
          id: data.id,
          name: data.name,
          lastUpdated: data.created_at,
          overallGPA: data.overallGPA,
          majorGPA: data.majorGPA,
          courses: data.courses || [],
          majorCourses: data.majorCourses || []
        });
        
        setCourses(data.courses || []);
        setMajorCourses(data.majorCourses || []);
        setIsEditing(true);
      } else {
        console.error('Failed to load GPA for editing');
      }
    } catch (error) {
      console.error('Error loading GPA for editing:', error);
    }
  };

  // Delete a saved GPA
  const deleteSavedGPA = async (gpaId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/grades/gpa/${gpaId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        // Update local state
        setSavedGPAs(savedGPAs.filter(gpa => gpa.id !== gpaId));
        
        // If we deleted the current GPA, reset current state
        if (currentGPAId === gpaId) {
          setCurrentGPAId(null);
          resetGPACalculator();
        }
      } else {
        console.error('Failed to delete GPA');
      }
    } catch (error) {
      console.error('Error deleting GPA:', error);
    }
  };

  // Duplicate a saved GPA
  const duplicateGPA = async (gpaId) => {
    try {
      // First get the GPA to duplicate
      const response = await fetch(`http://localhost:8000/api/grades/gpa/${gpaId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Create a duplicate with a new name
        const duplicatePayload = {
          name: `${data.name} (Copy)`,
          overallGPA: data.overallGPA,
          majorGPA: data.majorGPA,
          courses: data.courses || [],
          majorCourses: data.majorCourses || []
        };
        
        // Save as a new GPA
        const saveResponse = await fetch('http://localhost:8000/api/grades/gpa/save', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(duplicatePayload)
        });
        
        if (saveResponse.ok) {
          // Refresh the list
          fetchSavedGPAs();
        } else {
          console.error('Failed to duplicate GPA');
        }
      } else {
        console.error('Failed to load GPA for duplication');
      }
    } catch (error) {
      console.error('Error duplicating GPA:', error);
    }
  };

  // Load central GPA data for editing
  const editGPA = () => {
    if (centralGPA.courses) {
      setCourses([...centralGPA.courses]);
    }
    if (centralGPA.majorCourses) {
      setMajorCourses([...centralGPA.majorCourses]);
    }
    setIsEditing(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setCourses([]);
    setMajorCourses([]);
  };

  // Reset GPA calculator
  const resetGPACalculator = () => {
    setCourses([]);
    setMajorCourses([]);
    setIsEditing(false);
    setCurrentGPAId(null);
    setCentralGPA({
      name: "My GPA",
      lastUpdated: new Date().toISOString(),
      overallGPA: "0.00",
      majorGPA: "0.00"
    });
  };

  return (
    <GPAContext.Provider
      value={{
        courses,
        setCourses,
        majorCourses,
        setMajorCourses,
        centralGPA,
        setCentralGPA,
        savedGPAs,
        setSavedGPAs,
        isLoading,
        currentGPAId,
        setCurrentGPAId,
        letterToGPA,
        calculateOverallGPA,
        calculateMajorGPA,
        updateCentralGPA,
        resetGPACalculator,
        fetchSavedGPAs,
        editSavedGPA,
        deleteSavedGPA,
        duplicateGPA,
        isEditing,
        setIsEditing,
        editGPA,
        cancelEditing,
        toggleCourseForMajor,
        addCourse
      }}
    >
      {children}
    </GPAContext.Provider>
  );
};

export const useGPA = () => {
  const context = useContext(GPAContext);
  if (!context) {
    throw new Error("useGPA must be used within a GPAProvider");
  }
  return context;
}; 