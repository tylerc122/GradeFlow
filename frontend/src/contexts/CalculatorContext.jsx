import React, { createContext, useContext, useState } from "react";

const CalculatorContext = createContext();

export const CalculatorProvider = ({ children }) => {
  const [isResultsView, setIsResultsView] = useState(false);

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
  };

  return (
    <CalculatorContext.Provider
      value={{
        // View state
        isResultsView,
        setIsResultsView,

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
