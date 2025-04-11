import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const GPAContext = createContext();

// Key for temporary storage before login
const PENDING_SAVE_KEY = 'pendingGPASave';

export const GPAProvider = ({ children }) => {
  // GPA courses data
  const [courses, setCourses] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const { user } = useAuth();
  
  // Central GPA data
  const [centralGPA, setCentralGPA] = useState({
    id: null,
    name: "My GPA",
    lastUpdated: new Date().toISOString(),
    overallGPA: "0.00",
    majorGPA: "0.00",
    courses: []
  });

  // Saved GPAs
  const [savedGPAs, setSavedGPAs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGPAId, setCurrentGPAId] = useState(null);

  // Hidden GPAs
  const [hiddenGPAs, setHiddenGPAs] = useState({
    overall: false,
    major: false
  });

  // Editing state
  const [isEditing, setIsEditing] = useState(false);

  // Conflict resolution state
  const [conflictStatus, setConflictStatus] = useState('idle');
  const [pendingData, setPendingData] = useState(null);

  // Load saved data from backend and localStorage on mount
  useEffect(() => {
    if (user) {
      checkAndResolvePostLogin();
    } else {
      if (conflictStatus === 'idle') {
        loadLocalStorageData(true);
      }
    }
  }, [user]);

  // React to authentication state changes
  useEffect(() => {
    if (!user) {
      // Reset all state if user logs out
      setCourses([]);
      setIsEditing(false);
      setCurrentGPAId(null);
      setCentralGPA({
        id: null,
        name: "My GPA",
        lastUpdated: new Date().toISOString(),
        overallGPA: "0.00",
        majorGPA: "0.00",
        courses: []
      });
      clearLocalStorageData();
    }
  }, [user]);

  // Save to localStorage whenever courses or editing state changes
  useEffect(() => {
    if (!user || (user && !currentGPAId && isEditing)) {
      if (!user && isEditing && courses.length > 0) {
        const localData = {
          courses,
          hiddenGPAs,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('gpaCalculatorData', JSON.stringify(localData));
      }
    } else {
      localStorage.removeItem('gpaCalculatorData');
    }
  }, [courses, isEditing, user, currentGPAId, hiddenGPAs]);

  // Load data from general localStorage (for guests or resuming sessions)
  const loadLocalStorageData = (isGuest = false) => {
    if (localStorage.getItem(PENDING_SAVE_KEY)) {
      console.log("Pending save key exists, skipping general local storage load.");
      return;
    }

    if (isGuest || (user && !currentGPAId)) {
        try {
            const savedData = localStorage.getItem('gpaCalculatorData');
            if (savedData) {
                const { courses: savedCourses, hiddenGPAs: savedHiddenGPAs } = JSON.parse(savedData);

                if (savedCourses?.length > 0) {
                    console.log("Loading data from general localStorage.");
                    setCourses(savedCourses || []);
                    setHiddenGPAs(savedHiddenGPAs || { overall: false, major: false });
                    setIsEditing(true);
                }
            }
        } catch (error) {
            console.error('Error loading general GPA data from localStorage:', error);
        }
    }
  };

  // Stash current calculator state before navigating to login
  const stashDataBeforeLogin = () => {
    if (courses.length > 0) {
      const dataToStash = {
        courses: [...courses],
        timestamp: Date.now()
      };
      localStorage.setItem(PENDING_SAVE_KEY, JSON.stringify(dataToStash));
      console.log("Stashed current courses to localStorage for pending save.");
    } else {
      localStorage.removeItem(PENDING_SAVE_KEY);
    }
  };

  // Check for stashed data after login and handle potential conflicts
  const checkAndResolvePostLogin = async () => {
     if (!user) return;

     const stashedDataString = localStorage.getItem(PENDING_SAVE_KEY);
     if (!stashedDataString) {
       console.log("No pending save data found. Fetching saved GPAs.");
       await fetchSavedGPAs();
       return;
     }

     console.log("Pending save data found. Processing...");
     setConflictStatus('pending');
     let parsedPendingData;
     try {
        parsedPendingData = JSON.parse(stashedDataString);
        setPendingData(parsedPendingData);
     } catch (error) {
        console.error("Error parsing pending save data:", error);
        localStorage.removeItem(PENDING_SAVE_KEY);
        setConflictStatus('idle');
        await fetchSavedGPAs();
        return;
     }

     setIsLoading(true);
     try {
        const response = await fetch(`${API_URL}/api/grades/gpa/saved`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
            const existingSavedGPAs = await response.json();
            setSavedGPAs(existingSavedGPAs);

            if (existingSavedGPAs.length > 0) {
                console.log("Conflict detected: Pending data and existing saved GPA(s).");
                setConflictStatus('conflict');
            } else {
                console.log("No conflict: Pending data exists, but no saved GPA. Saving pending data.");
                await resolveConflictReplaceSaved();
            }
        } else {
            console.error('Failed to load saved GPAs during conflict check.');
            localStorage.removeItem(PENDING_SAVE_KEY);
            setConflictStatus('idle');
            setPendingData(null);
            await fetchSavedGPAs();
        }
     } catch (error) {
        console.error('Error fetching saved GPAs during conflict check:', error);
        localStorage.removeItem(PENDING_SAVE_KEY);
        setConflictStatus('idle');
        setPendingData(null);
        await fetchSavedGPAs();
     } finally {
        setIsLoading(false);
     }
  };

  // Resolve conflict: User chose to keep their existing saved GPA
  const resolveConflictKeepSaved = async () => {
    console.log("Resolving conflict: Keeping saved GPA.");
    localStorage.removeItem(PENDING_SAVE_KEY);
    setPendingData(null);
    setConflictStatus('idle');
    setIsEditing(false);
    await fetchSavedGPAs();
  };

  // Resolve conflict: User chose to replace saved GPA with the pending one
  const resolveConflictReplaceSaved = async () => {
    console.log("Resolving conflict: Replacing with pending GPA.");
    if (!pendingData || !pendingData.courses) {
        console.error("Cannot replace: Pending data is missing.");
        localStorage.removeItem(PENDING_SAVE_KEY);
        setPendingData(null);
        setConflictStatus('idle');
        await fetchSavedGPAs();
        return;
    }

    setCourses(pendingData.courses);
    setIsEditing(true);
    setCurrentGPAId(null);

    await updateCentralGPA("My GPA");

    localStorage.removeItem(PENDING_SAVE_KEY);
    setPendingData(null);
    setConflictStatus('idle');
    await fetchSavedGPAs();
  };

  // Clear general localStorage data
  const clearLocalStorageData = () => {
    localStorage.removeItem('gpaCalculatorData');
  };

  // Fetch all saved GPAs from the backend
  const fetchSavedGPAs = async () => {
    if (conflictStatus === 'conflict' || conflictStatus === 'pending') {
        console.log("Skipping fetchSavedGPAs due to conflict status:", conflictStatus);
        return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/grades/gpa/saved`, {
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
          });
          setCurrentGPAId(mostRecent.id);
          // Ensure we're in view mode, not edit mode
          setIsEditing(false);
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
    
    // Filter out hidden courses
    const visibleCourses = courseList.filter(course => !course?.isHidden);
    
    if (visibleCourses.length === 0) return "0.00";
    
    const totalCredits = visibleCourses.reduce((sum, course) => sum + (parseFloat(course.credits) || 0), 0);
    const totalPoints = visibleCourses.reduce((sum, course) => {
      return sum + (parseFloat(course.credits) || 0) * letterToGPA(course.grade);
    }, 0);
    
    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  // Calculate overall and major GPA
  const calculateOverallGPA = () => calculateGPA(courses);
  const calculateMajorGPA = () => {
    // Only use courses marked as for major
    const coursesForMajor = courses.filter(course => course?.isForMajor && !course?.isHidden);
    // Check if there are any major courses
    if (coursesForMajor.length === 0) return "0.00";
    return calculateGPA(coursesForMajor);
  };

  // Toggle whether a course is included in major GPA
  const toggleCourseForMajor = (index) => {
    const updatedCourses = [...courses];
    if (updatedCourses[index]) {
        updatedCourses[index] = {
            ...updatedCourses[index],
            isForMajor: !updatedCourses[index]?.isForMajor
        };
        setCourses(updatedCourses);
    }
  };

  // Toggle whether a course is hidden from GPA calculation
  const toggleCourseVisibility = (index) => {
    const updatedCourses = [...courses];
    if (updatedCourses[index]) {
        updatedCourses[index] = {
            ...updatedCourses[index],
            isHidden: !updatedCourses[index]?.isHidden
        };
        setCourses(updatedCourses);
    }
  };

  // Add new course with isForMajor property initialized to false
  const addCourse = (courseData = {}) => {
    const newCourse = {
      id: `temp-${Date.now()}-${Math.random()}`,
      title: courseData.title || "",
      credits: courseData.credits || "",
      grade: courseData.grade || "A",
      isForMajor: courseData.isForMajor || false,
      isHidden: courseData.isHidden || false
    };
    setCourses([...courses, newCourse]);
    if (!isEditing) setIsEditing(true);
  };

  // Update the central GPA with current calculations and save to backend
  const updateCentralGPA = async (name = "My GPA") => {
    if (!user) {
      console.error("Cannot save GPA: User not authenticated.");
      return;
    }
    // Calculate GPAs
    const overallGPA = calculateOverallGPA();
    const majorGPA = calculateMajorGPA();
    
    // Create new GPA object
    const updatedGPA = {
      name: "My GPA",
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
        name: "My GPA",
        overallGPA,
        majorGPA,
        courses: [...courses],
      };
      
      // Determine if this is an update or a new GPA
      const url = currentGPAId ? 
        `${API_URL}/api/grades/gpa/${currentGPAId}` : 
        `${API_URL}/api/grades/gpa/save`;
      
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
        // Clear general local storage after successful save to backend
        clearLocalStorageData();
        // Refresh saved GPAs
        fetchSavedGPAs();
      } else {
        console.error('Failed to save GPA calculation');
      }
    } catch (error) {
      console.error('Error saving GPA calculation:', error);
      setIsEditing(true);
    }
  };

  // Edit a specific saved GPA
  const editSavedGPA = async (gpaId) => {
    if (conflictStatus !== 'idle') {
        console.warn("Cannot edit GPA while conflict resolution is pending.");
        return;
    }
    try {
      const response = await fetch(`${API_URL}/api/grades/gpa/${gpaId}`, {
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
        });
        
        setCourses(data.courses || []);
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
    if (conflictStatus !== 'idle') {
        console.warn("Cannot delete GPA while conflict resolution is pending.");
        return;
    }
    try {
      const response = await fetch(`${API_URL}/api/grades/gpa/${gpaId}`, {
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
    if (conflictStatus !== 'idle') {
        console.warn("Cannot duplicate GPA while conflict resolution is pending.");
        return;
    }
    try {
      // First get the GPA to duplicate
      const response = await fetch(`${API_URL}/api/grades/gpa/${gpaId}`, {
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
        };
        
        // Save as a new GPA
        const saveResponse = await fetch(`${API_URL}/api/grades/gpa/save`, {
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

  // Enter editing mode (for new or existing GPA)
  const editGPA = () => {
    if (conflictStatus !== 'idle') {
        console.warn("Cannot enter edit mode while conflict resolution is pending.");
        return;
    }

    if (currentGPAId) {
      if (centralGPA && centralGPA.courses) {
          setCourses(centralGPA.courses.map(c => ({...c, id: c.id || `temp-${Date.now()}-${Math.random()}`})));
      } else {
          setCourses([]);
      }
    }
    setIsEditing(true);
  };

  // Cancel editing mode
  const cancelEditing = () => {
    setIsEditing(false);
    if (currentGPAId) {
      fetchSavedGPAs();
    } else {
      setCourses([]);
      clearLocalStorageData();
    }
    if (conflictStatus !== 'idle') {
        localStorage.removeItem(PENDING_SAVE_KEY);
        setPendingData(null);
        setConflictStatus('idle');
    }
  };

  // Reset GPA calculator (e.g., start fresh)
  const resetGPACalculator = () => {
    if (conflictStatus !== 'idle') {
        console.warn("Cannot reset calculator while conflict resolution is pending.");
        return;
    }
    setCourses([]);
    setCentralGPA({
      id: null,
      name: "My GPA",
      lastUpdated: new Date().toISOString(),
      overallGPA: "0.00",
      majorGPA: "0.00",
      courses: []
    });
    setCurrentGPAId(null);
    setIsEditing(false);
    clearLocalStorageData();
  };

  // Toggle visibility of overall GPA
  const toggleOverallGPA = () => {
    setHiddenGPAs(prev => ({
      ...prev,
      overall: !prev.overall
    }));
  };

  // Toggle visibility of major GPA
  const toggleMajorGPA = () => {
    setHiddenGPAs(prev => ({
      ...prev,
      major: !prev.major
    }));
  };

  return (
    <GPAContext.Provider
      value={{
        courses,
        setCourses,
        centralGPA,
        savedGPAs,
        isLoading,
        currentGPAId,
        hiddenGPAs,
        isEditing,
        conflictStatus,
        pendingData,
        calculateOverallGPA,
        calculateMajorGPA,
        addCourse,
        toggleCourseForMajor,
        toggleCourseVisibility,
        updateCentralGPA,
        editSavedGPA,
        deleteSavedGPA,
        duplicateGPA,
        editGPA,
        cancelEditing,
        resetGPACalculator,
        toggleOverallGPA,
        toggleMajorGPA,
        fetchSavedGPAs,
        stashDataBeforeLogin,
        resolveConflictKeepSaved,
        resolveConflictReplaceSaved,
        loadLocalStorageData
      }}
    >
      {children}
    </GPAContext.Provider>
  );
};

export const useGPA = () => {
  const context = useContext(GPAContext);
  if (context === undefined) {
    throw new Error('useGPA must be used within a GPAProvider');
  }
  return context;
}; 