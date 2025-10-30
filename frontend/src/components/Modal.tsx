import React from 'react';
import { useSystemThemeOverride } from '@/hooks/useSystemThemeOverride';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  message?: { text: string; type: 'success' | 'error' | 'info' };
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, message }) => {
  // Ensure system dark mode has no effect
  useSystemThemeOverride();
  
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-sm sm:max-w-md w-full relative animate-fadeIn max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl sm:text-2xl font-bold focus:outline-none p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
          aria-label="Close modal"
          style={{ touchAction: 'manipulation' }}
        >
          ×
        </button>
        {message && (
          <div className={`mb-4 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-semibold text-center ${
            message.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
            message.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
            'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
          }`}>
            {message.text}
          </div>
        )}
        {children}
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default Modal; 
