// Usage: Wrap your page or section with <ResponsiveContainer>...</ResponsiveContainer> for mobile/desktop responsive layout.
import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`max-w-6xl mx-auto px-2 sm:px-4 md:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveContainer; 
