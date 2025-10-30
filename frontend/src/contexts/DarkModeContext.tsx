'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  resetToSystem: () => void;
  forceLightMode: () => void;
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
  const [isSystemMode, setIsSystemMode] = useState(false);

  // Global initialization - runs on every component mount
  useEffect(() => {
    // Force light mode globally on every component initialization
    if (typeof window !== 'undefined') {
      document.documentElement.style.colorScheme = 'light';
      document.documentElement.classList.remove('dark');
      
      // Override any system preferences
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#ffffff');
      }
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    // Completely ignore system dark mode - only use user's explicit choice
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      setIsSystemMode(false);
    } else {
      // Always default to light mode - ignore system preferences
      setIsDarkMode(false);
      setIsSystemMode(false);
      localStorage.setItem('theme', 'light');
    }
    
    setIsInitialized(true);
    
    // Ensure document always starts with light mode class
    document.documentElement.classList.remove('dark');
    
    // Override any system theme preferences
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#ffffff');
    }
    
    // Force light mode on document
    document.documentElement.style.colorScheme = 'light';
  }, []);

  useEffect(() => {
    if (isInitialized) {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        document.documentElement.style.colorScheme = 'light';
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
    setIsDarkMode(false);
    setIsSystemMode(false);
    localStorage.setItem('theme', 'light');
  };

  const forceLightMode = () => {
    setIsDarkMode(false);
    setIsSystemMode(false);
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode, resetToSystem, forceLightMode, isSystemMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}; 
