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

  // Get system preference
  const getSystemPreference = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  };

  // Update theme based on current mode
  const updateTheme = (systemPrefersDark: boolean, mode: 'system' | 'dark' | 'light') => {
    if (mode === 'system') {
      setIsDarkMode(systemPrefersDark);
      setIsSystemMode(true);
    } else {
      setIsDarkMode(mode === 'dark');
      setIsSystemMode(false);
    }
  };

  useEffect(() => {
    // Check for saved preference
    const savedThemeMode = localStorage.getItem('themeMode'); // 'system', 'dark', or 'light'
    const savedTheme = localStorage.getItem('theme'); // Legacy support
    
    const systemPrefersDark = getSystemPreference();
    
    // Handle legacy theme format or new themeMode format
    let themeMode: 'system' | 'dark' | 'light' = 'system';
    if (savedThemeMode) {
      themeMode = savedThemeMode as 'system' | 'dark' | 'light';
    } else if (savedTheme === 'dark' || savedTheme === 'light') {
      // Migrate from old format
      themeMode = savedTheme;
      localStorage.setItem('themeMode', themeMode);
      localStorage.removeItem('theme');
    }
    
    updateTheme(systemPrefersDark, themeMode);
    setIsInitialized(true);

    // Always listen for system theme changes
    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    
    if (mediaQuery) {
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const currentThemeMode = localStorage.getItem('themeMode') || 'system';
        
        // Only update if we're in system mode
        if (currentThemeMode === 'system') {
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

  // Periodically check system theme (as a backup to media query)
  useEffect(() => {
    if (!isSystemMode) return; // Only check if in system mode

    const checkSystemTheme = () => {
      const systemPrefersDark = getSystemPreference();
      if (isDarkMode !== systemPrefersDark) {
        setIsDarkMode(systemPrefersDark);
      }
    };

    // Check every 2 seconds when in system mode
    const interval = setInterval(checkSystemTheme, 2000);

    return () => clearInterval(interval);
  }, [isSystemMode, isDarkMode]);

  useEffect(() => {
    // Apply dark mode to document
    if (isInitialized) {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode, isInitialized]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    setIsSystemMode(false);
    localStorage.setItem('themeMode', newMode ? 'dark' : 'light');
    // Keep legacy support
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const setDarkMode = (dark: boolean) => {
    setIsDarkMode(dark);
    setIsSystemMode(false);
    localStorage.setItem('themeMode', dark ? 'dark' : 'light');
    // Keep legacy support
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  const resetToSystem = () => {
    const systemPrefersDark = getSystemPreference();
    setIsDarkMode(systemPrefersDark);
    setIsSystemMode(true);
    localStorage.setItem('themeMode', 'system');
    localStorage.removeItem('theme');
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode, resetToSystem, isSystemMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}; 
