/**
 * Controls context for user preferences i.e tutorial status.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the context
const UserPreferencesContext = createContext();

// Custom hook to use the context
export const useUserPreferences = () => useContext(UserPreferencesContext);

// Provider component
export const UserPreferencesProvider = ({ children }) => {
  // Initialize state from localStorage or with defaults
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    const saved = localStorage.getItem('hasSeenTutorial');
    return saved === 'true' ? true : false;
  });

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem('hasSeenTutorial', hasSeenTutorial);
  }, [hasSeenTutorial]);

  // Function to mark tutorial as seen
  const markTutorialAsSeen = () => {
    setHasSeenTutorial(true);
  };

  // Function to reset tutorial status (to show it again)
  const resetTutorialStatus = () => {
    setHasSeenTutorial(false);
  };

  // Value object that will be passed to consumers
  const value = {
    hasSeenTutorial,
    markTutorialAsSeen,
    resetTutorialStatus,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export default UserPreferencesProvider; 