/**
 * This utility function performs a clean reset of the calculator app
 * by clearing all relevant data from storage and forcing a clean page load.
 *
 * To be used from the "Calculate Another" button to prevent double rendering.
 */
export function cleanResetCalculator() {
  // Clear all session storage
  sessionStorage.setItem("forceReset", "true");
  sessionStorage.setItem("clearCategories", "true");
  sessionStorage.setItem("silentReset", "true");
  sessionStorage.removeItem("isResultsView");
  sessionStorage.removeItem("calculatorData");
  sessionStorage.removeItem("categories");
  sessionStorage.removeItem("originalCalculatorState");
  sessionStorage.removeItem("lastViewedCalculation");

  // Clear all local storage related to calculator
  localStorage.removeItem("categories");
  localStorage.removeItem("calculatorState");
  localStorage.removeItem("gradeCategories");
  localStorage.removeItem("grades");

  // Force a clean navigation to calculator page
  // Using window.open with _self and true parameters forces a complete reload
  // without any history or cache
  window.open("/calculator", "_self", "", true);
}
