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
  // Initialize state synchronously from localStorage to avoid race conditions
  const getInitialTheme = (): boolean => {
    if (typeof window === 'undefined') return false;
    const savedThemeMode = localStorage.getItem('themeMode');
    const savedTheme = localStorage.getItem('theme');
    
    // Migrate 'system' to 'light' immediately
    if (savedThemeMode === 'system') {
      localStorage.setItem('themeMode', 'light');
      localStorage.removeItem('theme');
      return false;
    }
    
    if (savedThemeMode === 'dark') return true;
    if (savedThemeMode === 'light') return false;
    if (savedTheme === 'dark') {
      localStorage.setItem('themeMode', 'dark');
      localStorage.removeItem('theme');
      return true;
    }
    if (savedTheme === 'light') {
      localStorage.setItem('themeMode', 'light');
      localStorage.removeItem('theme');
      return false;
    }
    
    // Default to light
    localStorage.setItem('themeMode', 'light');
    return false;
  };

  const [isDarkMode, setIsDarkMode] = useState(() => getInitialTheme());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSystemMode, setIsSystemMode] = useState(false);

  // Update theme based on current mode - NEVER use system preference
  const updateTheme = (mode: 'system' | 'dark' | 'light') => {
    // If mode is 'system', force migrate to 'light' - NEVER follow system
    if (mode === 'system') {
      setIsDarkMode(false); // Force light mode
      setIsSystemMode(false); // Not in system mode anymore
      localStorage.setItem('themeMode', 'light');
      localStorage.removeItem('theme');
    } else {
      setIsDarkMode(mode === 'dark');
      setIsSystemMode(false);
    }
  };

  // Single initialization effect - runs once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check for saved preference
    const savedThemeMode = localStorage.getItem('themeMode');
    const savedTheme = localStorage.getItem('theme');
    
    // Handle legacy theme format or new themeMode format
    // NEVER use system preference - always default to light
    let themeMode: 'system' | 'dark' | 'light' = 'light';
    if (savedThemeMode) {
      // If user has 'system' saved, FORCE migrate to 'light' - NEVER follow system
      if (savedThemeMode === 'system') {
        themeMode = 'light';
        localStorage.setItem('themeMode', 'light');
        localStorage.removeItem('theme');
      } else {
        themeMode = savedThemeMode as 'system' | 'dark' | 'light';
      }
    } else if (savedTheme === 'dark' || savedTheme === 'light') {
      // Migrate from old format
      themeMode = savedTheme;
      localStorage.setItem('themeMode', themeMode);
      localStorage.removeItem('theme');
    } else {
      // No saved preference - default to light and save it
      themeMode = 'light';
      localStorage.setItem('themeMode', 'light');
    }
    
    // Update theme state - this will trigger the DOM update effect
    updateTheme(themeMode);
    setIsInitialized(true);
  }, []);

  // Apply dark mode to document - runs whenever isDarkMode or isInitialized changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Always apply based on state, regardless of initialization
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
    // We don't follow system - reset to light mode instead
    setIsDarkMode(false);
    setIsSystemMode(false);
    localStorage.setItem('themeMode', 'light');
    localStorage.removeItem('theme');
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode, resetToSystem, isSystemMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}; 
