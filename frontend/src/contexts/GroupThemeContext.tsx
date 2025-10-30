"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface GroupTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  customCSS: string;
  customJS: string;
}

interface GroupThemeContextType {
  currentGroupTheme: GroupTheme | null;
  loading: boolean;
  updateGroupTheme: (groupId: string, theme: Partial<GroupTheme>) => Promise<void>;
  loadGroupTheme: (groupId: string) => Promise<void>;
  applyGroupTheme: (theme: GroupTheme) => void;
  resetTheme: () => void;
}

const GroupThemeContext = createContext<GroupThemeContextType | undefined>(undefined);

export const useGroupTheme = () => {
  const context = useContext(GroupThemeContext);
  if (context === undefined) {
    throw new Error('useGroupTheme must be used within a GroupThemeProvider');
  }
  return context;
};

interface GroupThemeProviderProps {
  children: ReactNode;
}

export const GroupThemeProvider: React.FC<GroupThemeProviderProps> = ({ children }) => {
  const [currentGroupTheme, setCurrentGroupTheme] = useState<GroupTheme | null>(null);
  const [loading, setLoading] = useState(false);

  const loadGroupTheme = async (groupId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No token found for group theme loading');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/groups/${groupId}/theme`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.theme) {
          setCurrentGroupTheme(result.theme);
          applyGroupTheme(result.theme);
        }
      } else {
        console.error('Failed to load group theme:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading group theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGroupTheme = async (groupId: string, theme: Partial<GroupTheme>) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/groups/${groupId}/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ theme })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.theme) {
          setCurrentGroupTheme(result.theme);
          applyGroupTheme(result.theme);
        }
      } else {
        throw new Error('Failed to update group theme');
      }
    } catch (error) {
      console.error('Error updating group theme:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const applyGroupTheme = (theme: GroupTheme) => {
    // Apply CSS custom properties
    const root = document.documentElement;
    
    root.style.setProperty('--group-primary-color', theme.primaryColor);
    root.style.setProperty('--group-secondary-color', theme.secondaryColor);
    root.style.setProperty('--group-background-color', theme.backgroundColor);
    root.style.setProperty('--group-text-color', theme.textColor);
    root.style.setProperty('--group-accent-color', theme.accentColor);

    // Apply custom CSS
    if (theme.customCSS) {
      let customStyleElement = document.getElementById('group-custom-css');
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'group-custom-css';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = theme.customCSS;
    }

    // Apply custom JS
    if (theme.customJS) {
      try {
        // Remove previous custom JS
        const existingScript = document.getElementById('group-custom-js');
        if (existingScript) {
          existingScript.remove();
        }

        // Add new custom JS
        const scriptElement = document.createElement('script');
        scriptElement.id = 'group-custom-js';
        scriptElement.textContent = theme.customJS;
        document.head.appendChild(scriptElement);
      } catch (error) {
        console.error('Error executing custom JS:', error);
      }
    }
  };

  const resetTheme = () => {
    // Reset CSS custom properties to defaults
    const root = document.documentElement;
    
    root.style.removeProperty('--group-primary-color');
    root.style.removeProperty('--group-secondary-color');
    root.style.removeProperty('--group-background-color');
    root.style.removeProperty('--group-text-color');
    root.style.removeProperty('--group-accent-color');

    // Remove custom CSS and JS
    const customStyleElement = document.getElementById('group-custom-css');
    if (customStyleElement) {
      customStyleElement.remove();
    }

    const customScriptElement = document.getElementById('group-custom-js');
    if (customScriptElement) {
      customScriptElement.remove();
    }

    setCurrentGroupTheme(null);
  };

  const value: GroupThemeContextType = {
    currentGroupTheme,
    loading,
    updateGroupTheme,
    loadGroupTheme,
    applyGroupTheme,
    resetTheme
  };

  return (
    <GroupThemeContext.Provider value={value}>
      {children}
    </GroupThemeContext.Provider>
  );
};
