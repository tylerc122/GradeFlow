// Create a new file: src/contexts/CalculatorContext.jsx
import React, { createContext, useContext, useState } from "react";

const CalculatorContext = createContext();

export const CalculatorProvider = ({ children }) => {
  const [isResultsView, setIsResultsView] = useState(false);

  return (
    <CalculatorContext.Provider value={{ isResultsView, setIsResultsView }}>
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
