'use client';

import { useDarkMode } from '@/contexts/DarkModeContext';

const Movies = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-4`}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Movies
        </h1>
      </div>
    </div>
  );
};

export default Movies;




