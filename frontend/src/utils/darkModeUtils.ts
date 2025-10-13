// Dark Mode Utility Classes
export const darkModeClasses = {
  // Background colors
  backgrounds: {
    primary: 'bg-white dark:bg-gray-800',
    secondary: 'bg-gray-50 dark:bg-gray-900',
    tertiary: 'bg-gray-100 dark:bg-gray-700',
    card: 'bg-white dark:bg-gray-800',
    sidebar: 'bg-white dark:bg-gray-800',
    navbar: 'bg-white dark:bg-gray-800',
    modal: 'bg-white dark:bg-gray-800',
    overlay: 'bg-black bg-opacity-50',
  },
  
  // Text colors
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-700 dark:text-gray-300',
    tertiary: 'text-gray-600 dark:text-gray-400',
    muted: 'text-gray-500 dark:text-gray-500',
    link: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
  },
  
  // Border colors
  borders: {
    primary: 'border-gray-200 dark:border-gray-700',
    secondary: 'border-gray-300 dark:border-gray-600',
    focus: 'border-blue-500 dark:border-blue-400',
  },
  
  // Input styles
  inputs: {
    base: 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500',
    error: 'border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500',
  },
  
  // Button styles
  buttons: {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
  },
  
  // Common combinations
  common: {
    card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
    input: 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    button: 'bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
  }
};

// Helper function to apply dark mode classes
export const applyDarkMode = (baseClasses: string, darkClasses: string) => {
  return `${baseClasses} ${darkClasses}`;
};

// Common dark mode patterns
export const darkModePatterns = {
  // Container with dark mode
  container: 'bg-white dark:bg-gray-800 transition-colors duration-200',
  
  // Text with dark mode
  text: 'text-gray-900 dark:text-white transition-colors duration-200',
  
  // Input with dark mode
  input: 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200',
  
  // Button with dark mode
  button: 'bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
  
  // Card with dark mode
  card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg transition-colors duration-200',
  
  // Sidebar with dark mode
  sidebar: 'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-200',
  
  // Modal with dark mode
  modal: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg transition-colors duration-200',
};

export default darkModeClasses;
