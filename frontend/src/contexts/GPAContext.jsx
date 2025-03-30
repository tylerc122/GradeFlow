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

  // Editing state
  const [isEditing, setIsEditing] = useState(false);

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      const savedCoursesData = localStorage.getItem('gpaCourses');
      const savedMajorCoursesData = localStorage.getItem('gpaMajorCourses');
      const savedCentralGPA = localStorage.getItem('centralGPA');
      
      if (savedCoursesData) setCourses(JSON.parse(savedCoursesData));
      if (savedMajorCoursesData) setMajorCourses(JSON.parse(savedMajorCoursesData));
      if (savedCentralGPA) setCentralGPA(JSON.parse(savedCentralGPA));
    } catch (error) {
      console.error('Failed to load saved GPA data:', error);
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('gpaCourses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('gpaMajorCourses', JSON.stringify(majorCourses));
  }, [majorCourses]);

  useEffect(() => {
    localStorage.setItem('centralGPA', JSON.stringify(centralGPA));
  }, [centralGPA]);

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
  const calculateMajorGPA = () => calculateGPA(majorCourses);

  // Update the central GPA with current calculations
  const updateCentralGPA = (name = "My GPA") => {
    setCentralGPA({
      name,
      lastUpdated: new Date().toISOString(),
      overallGPA: calculateOverallGPA(),
      majorGPA: calculateMajorGPA(),
      courses: [...courses],
      majorCourses: [...majorCourses]
    });
    setIsEditing(false);
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
        letterToGPA,
        calculateOverallGPA,
        calculateMajorGPA,
        updateCentralGPA,
        resetGPACalculator,
        isEditing,
        setIsEditing,
        editGPA,
        cancelEditing
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