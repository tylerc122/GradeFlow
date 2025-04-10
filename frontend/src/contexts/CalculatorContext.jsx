import React, { createContext, useContext, useState, useEffect } from "react";

const CalculatorContext = createContext();

export const CalculatorProvider = ({ children }) => {
  const [isResultsView, setIsResultsView] = useState(false);
  // Add state for last viewed calculation
  const [lastViewedCalculation, setLastViewedCalculation] = useState(() => {
    return sessionStorage.getItem('lastViewedCalculation') || null;
  });

  // Add a flag to indicate when we want to view the grades list
  const [showGradesList, setShowGradesList] = useState(false);

  // Step tracking
  const [activeStep, setActiveStep] = useState(0);

  // Category management
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  // Grade data
  const [mode, setMode] = useState("blackboard");
  const [rawGradeData, setRawGradeData] = useState("");
  const [parsedGrades, setParsedGrades] = useState(null);
  const [uncategorizedAssignments, setUncategorizedAssignments] = useState([]);
  const [manualGrades, setManualGrades] = useState([]);

  // What-if analysis states
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [targetGrade, setTargetGrade] = useState("");
  const [hypotheticalScores, setHypotheticalScores] = useState({});
  const [hypotheticalAssignments, setHypotheticalAssignments] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hiddenAssignments, setHiddenAssignments] = useState([]);
  
  // Track if user has entered data
  const hasData = categories.length > 0 || rawGradeData.trim() !== "" || parsedGrades !== null || manualGrades.length > 0;
  
  // Add beforeunload event handler to warn before page refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Skip warning if we're intentionally resetting
      if (window.sessionStorage.getItem('silentReset') === 'true') {
        return;
      }
      
      if (hasData) {
        // Standard way to show a confirmation dialog before leaving
        const message = "You have unsaved data. Are you sure you want to leave? All your data will be lost.";
        e.returnValue = message; // Standard for most browsers
        return message; // For some older browsers
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasData]);
  
  // Add effect to check for force reset on component mount
  useEffect(() => {
    const forceReset = sessionStorage.getItem('forceReset');
    if (forceReset === 'true') {
      // Clear the flag
      sessionStorage.removeItem('forceReset');
      // Hard reset categories and other state
      setCategories([]);
      setActiveStep(0);
    }
  }, []);

  // Reset all calculator state
  const resetCalculator = () => {
    // First set a flag to silence the beforeunload warning
    window.sessionStorage.setItem('silentReset', 'true');
    
    // Completely reset all state
    setActiveStep(0);
    setCategories([]);
    setError(null);
    setMode("blackboard");
    setRawGradeData("");
    setParsedGrades(null);
    setUncategorizedAssignments([]);
    setManualGrades([]);
    setWhatIfMode(false);
    setTargetGrade("");
    setHypotheticalScores({});
    setHypotheticalAssignments([]);
    setDialogOpen(false);
    setSelectedCategory(null);
    setHiddenAssignments([]);
    setIsResultsView(false);
    
    // Clear ALL session and local storage related to calculator state
    sessionStorage.removeItem('isResultsView');
    sessionStorage.removeItem('lastViewedCalculation');
    sessionStorage.removeItem('calculatorState');
    localStorage.removeItem('calculatorState');
    localStorage.removeItem('categories');
    localStorage.removeItem('grades');
    
    // Set a flag for the Calculator component to check on mount
    window.sessionStorage.setItem('forceReset', 'true');
    
    // Clear the silent reset flag after a moment
    setTimeout(() => {
      window.sessionStorage.removeItem('silentReset');
    }, 1000);
  };

  // Function to save last viewed calculation to session storage
  const setAndSaveLastViewedCalculation = (calculationId) => {
    // If null, remove from storage
    if (calculationId === null) {
      sessionStorage.removeItem('lastViewedCalculation');
    } else {
      sessionStorage.setItem('lastViewedCalculation', calculationId);
      // When setting a specific calculation, we're not viewing the list
      setShowGradesList(false);
    }
    setLastViewedCalculation(calculationId);
  };

  // Clear last viewed calculation
  const clearLastViewedCalculation = () => {
    sessionStorage.removeItem('lastViewedCalculation');
    setLastViewedCalculation(null);
    // When clearing, we want to view the list
    setShowGradesList(true);
  };

  return (
    <CalculatorContext.Provider
      value={{
        // View state
        isResultsView,
        setIsResultsView,

        // Last viewed calculation management
        lastViewedCalculation,
        setLastViewedCalculation: setAndSaveLastViewedCalculation,
        clearLastViewedCalculation,
        showGradesList,
        setShowGradesList,

        // Step tracking
        activeStep,
        setActiveStep,

        // Category management
        categories,
        setCategories,
        error,
        setError,

        // Grade data
        mode,
        setMode,
        rawGradeData,
        setRawGradeData,
        parsedGrades,
        setParsedGrades,
        uncategorizedAssignments,
        setUncategorizedAssignments,
        manualGrades,
        setManualGrades,

        // What-if analysis
        whatIfMode,
        setWhatIfMode,
        targetGrade,
        setTargetGrade,
        hypotheticalScores,
        setHypotheticalScores,
        hypotheticalAssignments,
        setHypotheticalAssignments,
        dialogOpen,
        setDialogOpen,
        selectedCategory,
        setSelectedCategory,
        hiddenAssignments,
        setHiddenAssignments,

        // Actions
        resetCalculator,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error("useCalculator must be used within a CalculatorProvider");
  }
  return context;
};
