'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  resetToSystem: () => void;
  isSystemMode: boolean;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

interface DarkModeProviderProps {
  children: React.ReactNode;
}

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSystemMode, setIsSystemMode] = useState(true);

  useEffect(() => {
    // Check for saved preference first, then fall back to system preference
    const savedTheme = localStorage.getItem('theme');
    
    // Use a more robust system detection that works on mobile
    const getSystemPreference = () => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      // Fallback for older browsers or SSR
      return false;
    };
    
    const systemPrefersDark = getSystemPreference();
    
    if (savedTheme === 'dark' || savedTheme === 'light') {
      // User has explicitly set a preference
      setIsDarkMode(savedTheme === 'dark');
      setIsSystemMode(false);
    } else {
      // Follow system preference
      setIsDarkMode(systemPrefersDark);
      setIsSystemMode(true);
    }
    
    setIsInitialized(true);

    // Listen for system theme changes only if user hasn't set a preference
    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    
    if (mediaQuery) {
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
          // Only follow system changes if user hasn't set a preference
          setIsDarkMode(e.matches);
          setIsSystemMode(true);
        }
      };

      // Use addEventListener for better mobile support
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleSystemThemeChange);
      }
      
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleSystemThemeChange);
        } else {
          mediaQuery.removeListener(handleSystemThemeChange);
        }
      };
    }
  }, []);

  useEffect(() => {
    // Apply dark mode to document
    if (isInitialized) {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }, [isDarkMode, isInitialized]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    setIsSystemMode(false);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const setDarkMode = (dark: boolean) => {
    setIsDarkMode(dark);
    setIsSystemMode(false);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  const resetToSystem = () => {
    const systemPrefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
    setIsDarkMode(systemPrefersDark);
    setIsSystemMode(true);
    localStorage.removeItem('theme');
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode, resetToSystem, isSystemMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}; 
