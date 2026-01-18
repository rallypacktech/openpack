import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// Inject styles directly into document
const injectAccessibilityStyles = () => {
  const styleId = 'accessibility-dynamic-styles';
  let styleEl = document.getElementById(styleId);
  
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  
  return styleEl;
};

const applyStyles = (highContrast, fontSize, reducedMotion) => {
  const styleEl = injectAccessibilityStyles();
  
  const fontSizeMap = {
    small: '0.875rem',
    normal: '1rem',
    large: '1.25rem',
    xlarge: '1.5rem'
  };
  
  const baseFontSize = fontSizeMap[fontSize] || '1rem';
  
  let css = `
    /* Font Size */
    html, body {
      font-size: ${baseFontSize} !important;
    }
    
    body * {
      font-size: inherit !important;
    }
    
    .text-xs { font-size: 0.75em !important; }
    .text-sm { font-size: 0.875em !important; }
    .text-base { font-size: 1em !important; }
    .text-lg { font-size: 1.125em !important; }
    .text-xl { font-size: 1.25em !important; }
    .text-2xl { font-size: 1.5em !important; }
    .text-3xl { font-size: 1.875em !important; }
  `;
  
  if (reducedMotion) {
    css += `
      /* Reduced Motion */
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
  }
  
  if (highContrast) {
    css += `
      /* High Contrast Mode */
      body {
        background: white !important;
        color: black !important;
        filter: contrast(1.3);
      }
      
      * {
        color: black !important;
        border-color: black !important;
      }
      
      .bg-white, .bg-gray-50, .bg-gray-100, .bg-blue-50,
      .bg-green-50, .bg-red-50, .bg-yellow-50, .bg-purple-50,
      .bg-orange-50, .bg-pink-50, [class*="bg-gray"],
      [class*="bg-blue"][class*="-50"],
      [class*="bg-green"][class*="-50"],
      [class*="bg-red"][class*="-50"] {
        background-color: #f5f5f5 !important;
      }
      
      .bg-blue-600, .bg-blue-700, .bg-green-600, .bg-green-700,
      .bg-red-600, .bg-red-700, .bg-indigo-600, .bg-purple-600,
      .bg-yellow-600, .bg-orange-600,
      [class*="bg-blue"][class*="-600"],
      [class*="bg-blue"][class*="-700"],
      [class*="bg-green"][class*="-600"],
      [class*="bg-red"][class*="-600"],
      [class*="bg-indigo"][class*="-600"],
      [class*="bg-purple"][class*="-600"] {
        background-color: black !important;
        color: white !important;
        border: 2px solid black !important;
      }
      
      .bg-blue-600 *, .bg-blue-700 *, .bg-green-600 *,
      .bg-red-600 *, [class*="-600"] *, [class*="-700"] * {
        color: white !important;
      }
      
      button, a, input, select, textarea {
        border: 2px solid black !important;
        font-weight: 600 !important;
      }
      
      button:not([class*="-600"]):not([class*="-700"]),
      a:not([class*="-600"]):not([class*="-700"]) {
        background-color: #e8e8e8 !important;
        color: black !important;
      }
      
      /* Force header and nav backgrounds */
      header, header[role="banner"],
      nav, nav[aria-label="Main navigation"] {
        background-color: white !important;
      }
      
      /* Nav links - unselected state - must target very specifically */
      header nav a.text-gray-600,
      header nav a[class*="text-gray"],
      header nav a:not([aria-current="page"]),
      nav[aria-label="Main navigation"] a.text-gray-600,
      nav[aria-label="Main navigation"] a:not([aria-current="page"]) {
        background-color: #e0e0e0 !important;
        color: black !important;
      }
      
      /* Nav links - selected state */
      header nav a[aria-current="page"],
      header nav a.bg-blue-50,
      header nav a.text-blue-600,
      nav[aria-label="Main navigation"] a[aria-current="page"],
      nav[aria-label="Main navigation"] a.bg-blue-50 {
        background-color: black !important;
        color: white !important;
        font-weight: bold !important;
      }
      
      /* Force ALL children of nav links to inherit correct color */
      header nav a.text-gray-600 *,
      header nav a:not([aria-current="page"]) *,
      header nav a:not([aria-current="page"]) span,
      nav a.text-gray-600 *,
      nav a:not([aria-current="page"]) *,
      nav a:not([aria-current="page"]) span {
        color: black !important;
      }
      
      header nav a[aria-current="page"] *,
      header nav a.bg-blue-50 *,
      nav a[aria-current="page"] *,
      nav a.bg-blue-50 * {
        color: white !important;
      }
      
      /* Icons in unselected nav links */
      header nav a.text-gray-600 svg,
      header nav a:not([aria-current="page"]) svg,
      nav a.text-gray-600 svg,
      nav a:not([aria-current="page"]) svg {
        filter: brightness(0) !important;
      }
      
      /* Icons in selected nav items */
      header nav a[aria-current="page"] svg,
      header nav a.bg-blue-50 svg,
      nav a[aria-current="page"] svg,
      nav a.bg-blue-50 svg {
        filter: brightness(0) invert(1) !important;
      }
      
      input, select, textarea {
        background-color: white !important;
        color: black !important;
      }
      
      svg {
        filter: brightness(0) !important;
      }
      
      .bg-blue-600 svg, .bg-green-600 svg, .bg-red-600 svg,
      [class*="-600"] svg, [class*="-700"] svg {
        filter: brightness(0) invert(1) !important;
      }
      
      *:focus, *:focus-visible {
        outline: 3px solid black !important;
        outline-offset: 3px !important;
      }
      
      * {
        box-shadow: none !important;
        text-shadow: none !important;
      }
      
      /* Toggle switches */
      button[role="switch"] {
        background-color: #cccccc !important;
        border: 3px solid black !important;
      }
      
      button[role="switch"][data-state="checked"] {
        background-color: black !important;
      }
      
      button[role="switch"] span {
        background-color: white !important;
        border: 2px solid black !important;
      }
    `;
  }
  
  styleEl.textContent = css;
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
    
    // Apply styles immediately
    applyStyles(savedHighContrast, savedFontSize, savedReducedMotion);
  }, []);
  
  useEffect(() => {
    // Re-apply styles whenever settings change
    applyStyles(highContrast, fontSize, reducedMotion);
  }, [highContrast, fontSize, reducedMotion]);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('highContrast', newValue);
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
  };

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    localStorage.setItem('reducedMotion', newValue);
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