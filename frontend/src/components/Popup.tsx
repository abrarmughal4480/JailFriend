import React, { useEffect } from 'react';
import { useSystemThemeOverride } from '@/hooks/useSystemThemeOverride';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  showConfirm?: boolean;
  confirmText?: string;
  cancelText?: string;
}

interface PopupProps {
  popup: PopupState;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const Popup: React.FC<PopupProps> = ({ popup, onClose, onConfirm, onCancel }) => {
  // Ensure system dark mode has no effect
  useSystemThemeOverride();
  
  const { isDarkMode } = useDarkMode();
  
  // Prevent background scrolling when popup is open
  useEffect(() => {
    if (popup.isOpen) {
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      // Prevent scroll on mobile
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Re-enable scrolling
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
  }, [popup.isOpen]);

  if (!popup.isOpen) return null;

  const getIcon = () => {
    switch (popup.type) {
      case 'success':
        return (
          <div className={`w-12 h-12 sm:w-16 sm:h-16 ${isDarkMode ? 'bg-green-500/20 border-green-400/30' : 'bg-green-100/50 border-green-300/30'} backdrop-blur-sm border rounded-full flex items-center justify-center`}>
            <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className={`w-12 h-12 sm:w-16 sm:h-16 ${isDarkMode ? 'bg-red-500/20 border-red-400/30' : 'bg-red-100/50 border-red-300/30'} backdrop-blur-sm border rounded-full flex items-center justify-center`}>
            <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className={`w-12 h-12 sm:w-16 sm:h-16 ${isDarkMode ? 'bg-yellow-500/20 border-yellow-400/30' : 'bg-yellow-100/50 border-yellow-300/30'} backdrop-blur-sm border rounded-full flex items-center justify-center`}>
            <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className={`w-12 h-12 sm:w-16 sm:h-16 ${isDarkMode ? 'bg-blue-500/20 border-blue-400/30' : 'bg-blue-100/50 border-blue-300/30'} backdrop-blur-sm border rounded-full flex items-center justify-center`}>
            <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
    }
  };

  const getButtonClass = () => {
    switch (popup.type) {
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'error':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-2 sm:p-4 bg-black/20 backdrop-blur-md">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md mx-2 sm:mx-4 transform transition-all duration-300 scale-100 max-h-[95vh] overflow-y-auto`}>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            {getIcon()}
          </div>
          
          <div className="text-center">
            <h3 className={`text-lg sm:text-xl font-semibold mb-2 break-words ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {popup.title}
            </h3>
            <p className={`mb-4 sm:mb-6 text-sm sm:text-base break-words leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {popup.message}
            </p>
            
            {popup.showConfirm ? (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    if (onCancel) onCancel();
                    onClose();
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base touch-manipulation ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {popup.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base touch-manipulation ${getButtonClass()}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {popup.confirmText || 'Confirm'}
                </button>
              </div>
            ) : (
              <button
                onClick={onClose}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base touch-manipulation ${getButtonClass()}`}
                style={{ touchAction: 'manipulation' }}
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Popup;
export type { PopupState }; 

