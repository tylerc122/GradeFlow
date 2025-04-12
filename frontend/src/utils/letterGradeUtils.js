/**
 * Utility functions for letter grades.
 */
export const LETTER_GRADES = {
  "A+": { points: 4.0, minPercent: 97 },
  A: { points: 4.0, minPercent: 93 },
  "A-": { points: 3.7, minPercent: 90 },
  "B+": { points: 3.3, minPercent: 87 },
  B: { points: 3.0, minPercent: 83 },
  "B-": { points: 2.7, minPercent: 80 },
  "C+": { points: 2.3, minPercent: 77 },
  C: { points: 2.0, minPercent: 73 },
  "C-": { points: 1.7, minPercent: 70 },
  "D+": { points: 1.3, minPercent: 67 },
  D: { points: 1.0, minPercent: 63 },
  "D-": { points: 0.7, minPercent: 60 },
  F: { points: 0.0, minPercent: 0 },
};

// Check if input is a valid letter grade
export const isLetterGrade = (value) => {
  if (!value || typeof value !== "string") return false;
  return Object.keys(LETTER_GRADES).includes(value.trim().toUpperCase());
};

// Check if input is a valid percentage
export const isPercentage = (value) => {
  if (value === null || value === undefined) return false;
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num <= 100;
};

// Convert letter grade to points
export const letterGradeToPoints = (grade) => {
  if (!isLetterGrade(grade)) return null;
  return LETTER_GRADES[grade.trim().toUpperCase()].points;
};

// Convert percentage to letter grade
export const percentageToLetter = (percentage) => {
  if (!isPercentage(percentage)) return null;

  for (const [letter, data] of Object.entries(LETTER_GRADES)) {
    if (percentage >= data.minPercent) {
      return letter;
    }
  }
  return "F";
};

// Get GPA from percentage
export const calculateGPA = (percentage) => {
  const letter = percentageToLetter(percentage);
  return letter ? LETTER_GRADES[letter].points : 0;
};
