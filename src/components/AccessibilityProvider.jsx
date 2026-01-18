import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export default function AccessibilityProvider({ children }) {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    const savedFontSize = localStorage.getItem('fontSize') || 'normal';
    const savedReducedMotion = localStorage.getItem('reducedMotion') === 'true';
    
    setHighContrast(savedHighContrast);
    setFontSize(savedFontSize);
    setReducedMotion(savedReducedMotion);

    // Apply to document - force re-render
    if (savedHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }
    if (savedReducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    }
    document.documentElement.setAttribute('data-font-size', savedFontSize);
    
    // Force style recalculation
    document.body.style.display = 'none';
    document.body.offsetHeight; // trigger reflow
    document.body.style.display = '';
  }, []);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('highContrast', newValue);
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Force style recalculation
    document.body.style.display = 'none';
    document.body.offsetHeight;
    document.body.style.display = '';
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    document.documentElement.setAttribute('data-font-size', size);
    
    // Force style recalculation
    document.body.style.display = 'none';
    document.body.offsetHeight;
    document.body.style.display = '';
  };

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    localStorage.setItem('reducedMotion', newValue);
    
    if (newValue) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    
    // Force style recalculation
    document.body.style.display = 'none';
    document.body.offsetHeight;
    document.body.style.display = '';
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        fontSize,
        changeFontSize,
        reducedMotion,
        toggleReducedMotion
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}