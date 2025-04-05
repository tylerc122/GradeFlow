import React, { createContext, useContext, useState } from "react";

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

  // Save complete calculation state to localStorage
  const saveCalculationState = () => {
    const state = {
      isResultsView,
      activeStep,
      categories,
      mode,
      rawGradeData,
      parsedGrades,
      uncategorizedAssignments,
      manualGrades,
      whatIfMode,
      targetGrade,
      hypotheticalScores,
      hypotheticalAssignments,
      hiddenAssignments,
    };
    
    try {
      localStorage.setItem('calculationState', JSON.stringify(state));
      console.log("Calculation state saved to localStorage");
    } catch (error) {
      console.error("Error saving calculation state to localStorage", error);
    }
  };

  // Load calculation state from localStorage
  const loadCalculationState = () => {
    try {
      const savedState = localStorage.getItem('calculationState');
      if (savedState) {
        const state = JSON.parse(savedState);
        
        // Only restore state if there's actual content
        if (state.categories?.length || state.rawGradeData || state.parsedGrades || state.manualGrades?.length) {
          setIsResultsView(state.isResultsView || false);
          setActiveStep(state.activeStep || 0);
          setCategories(state.categories || []);
          setMode(state.mode || "blackboard");
          setRawGradeData(state.rawGradeData || "");
          setParsedGrades(state.parsedGrades || null);
          setUncategorizedAssignments(state.uncategorizedAssignments || []);
          setManualGrades(state.manualGrades || []);
          setWhatIfMode(state.whatIfMode || false);
          setTargetGrade(state.targetGrade || "");
          setHypotheticalScores(state.hypotheticalScores || {});
          setHypotheticalAssignments(state.hypotheticalAssignments || []);
          setHiddenAssignments(state.hiddenAssignments || []);
          console.log("Calculation state loaded from localStorage");
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error loading calculation state from localStorage", error);
      return false;
    }
  };

  // Clear calculation state from localStorage
  const clearCalculationState = () => {
    try {
      localStorage.removeItem('calculationState');
      console.log("Calculation state cleared from localStorage");
    } catch (error) {
      console.error("Error clearing calculation state from localStorage", error);
    }
  };

  // Reset all calculator state
  const resetCalculator = () => {
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
    // Clear isResultsView from session storage
    sessionStorage.removeItem('isResultsView');
    // Clear notification flag from session storage
    sessionStorage.removeItem('restoredNotificationShown');
    // Clear calculation state from localStorage
    clearCalculationState();
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

        // Persistence
        saveCalculationState,
        loadCalculationState,
        clearCalculationState,

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
