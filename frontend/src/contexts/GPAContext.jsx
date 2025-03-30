import React, { createContext, useContext, useState, useEffect } from "react";

const GPAContext = createContext();

export const GPAProvider = ({ children }) => {
  // GPA courses data
  const [courses, setCourses] = useState([]);
  const [technicalCourses, setTechnicalCourses] = useState([]);
  
  // Central GPA data
  const [centralGPA, setCentralGPA] = useState({
    name: "My GPA",
    lastUpdated: new Date().toISOString(),
    overallGPA: "0.00",
    technicalGPA: "0.00"
  });

  // Editing state
  const [isEditing, setIsEditing] = useState(false);

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      const savedCoursesData = localStorage.getItem('gpaCourses');
      const savedTechnicalCoursesData = localStorage.getItem('gpaTechnicalCourses');
      const savedCentralGPA = localStorage.getItem('centralGPA');
      
      if (savedCoursesData) setCourses(JSON.parse(savedCoursesData));
      if (savedTechnicalCoursesData) setTechnicalCourses(JSON.parse(savedTechnicalCoursesData));
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
    localStorage.setItem('gpaTechnicalCourses', JSON.stringify(technicalCourses));
  }, [technicalCourses]);

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

  // Calculate overall and technical GPA
  const calculateOverallGPA = () => calculateGPA(courses);
  const calculateTechnicalGPA = () => calculateGPA(technicalCourses);

  // Update the central GPA with current calculations
  const updateCentralGPA = (name = "My GPA") => {
    setCentralGPA({
      name,
      lastUpdated: new Date().toISOString(),
      overallGPA: calculateOverallGPA(),
      technicalGPA: calculateTechnicalGPA(),
      courses: [...courses],
      technicalCourses: [...technicalCourses]
    });
    setIsEditing(false);
  };

  // Load central GPA data for editing
  const editGPA = () => {
    if (centralGPA.courses) {
      setCourses([...centralGPA.courses]);
    }
    if (centralGPA.technicalCourses) {
      setTechnicalCourses([...centralGPA.technicalCourses]);
    }
    setIsEditing(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setCourses([]);
    setTechnicalCourses([]);
  };

  // Reset GPA calculator
  const resetGPACalculator = () => {
    setCourses([]);
    setTechnicalCourses([]);
    setIsEditing(false);
  };

  return (
    <GPAContext.Provider
      value={{
        courses,
        setCourses,
        technicalCourses,
        setTechnicalCourses,
        centralGPA,
        setCentralGPA,
        letterToGPA,
        calculateOverallGPA,
        calculateTechnicalGPA,
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