"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthGuard from '../../components/AuthGuard';
import DasboardLayout from '../../components/DasboardLayout';
import { GroupThemeProvider } from '../../contexts/GroupThemeContext';
import { useSystemThemeOverride } from '../../hooks/useSystemThemeOverride';

// Height context for auto-detecting remaining height
interface HeightContextType {
  remainingHeight: number;
  headerHeight: number;
  updateHeights: () => void;
}

const HeightContext = createContext<HeightContextType>({
  remainingHeight: 0,
  headerHeight: 64,
  updateHeights: () => {}
});

// Custom hook to use height context
export const useHeight = () => {
  const context = useContext(HeightContext);
  if (!context) {
    throw new Error('useHeight must be used within HeightProvider');
  }
  return context;
};

// Height provider component
const HeightProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Ensure system dark mode has no effect - especially for mobile systems
  useSystemThemeOverride();
  
  const [headerHeight, setHeaderHeight] = useState(64); // Default navbar height
  const [remainingHeight, setRemainingHeight] = useState(0);

  const updateHeights = () => {
    // Get navbar height dynamically
    const navbar = document.querySelector('nav');
    const navbarHeight = navbar ? navbar.offsetHeight : 64;
    
    // Calculate remaining height
    const windowHeight = window.innerHeight;
    const calculatedRemainingHeight = windowHeight - navbarHeight;
    
    setHeaderHeight(navbarHeight);
    setRemainingHeight(calculatedRemainingHeight);
  };

  useEffect(() => {
    // Initial calculation
    updateHeights();
    
    // Update on window resize
    const handleResize = () => {
      updateHeights();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Update when layout changes (after DOM updates)
    const observer = new MutationObserver(() => {
      setTimeout(updateHeights, 100); // Small delay to ensure DOM is updated
    });
    
    // Observe navbar changes
    const navbar = document.querySelector('nav');
    if (navbar) {
      observer.observe(navbar, { 
        attributes: true, 
        childList: true, 
        subtree: true 
      });
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  const value = {
    remainingHeight,
    headerHeight,
    updateHeights
  };

  return (
    <HeightContext.Provider value={value}>
      {children}
    </HeightContext.Provider>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/">
      <GroupThemeProvider>
        <HeightProvider>
          <DasboardLayout>
            <div className="w-full max-w-full overflow-x-hidden" style={{ 
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}>
              {children}
            </div>
          </DasboardLayout>
        </HeightProvider>
      </GroupThemeProvider>
    </AuthGuard>
  );
}
