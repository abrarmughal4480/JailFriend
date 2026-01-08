import React, { useEffect } from 'react';

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  showConfirm?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface PopupProps {
  popup: PopupState;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const Popup: React.FC<PopupProps> = ({ popup, onClose, onConfirm, onCancel }) => {
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
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100/50 dark:bg-green-500/20 backdrop-blur-sm border border-green-300/30 dark:border-green-400/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100/50 dark:bg-red-500/20 backdrop-blur-sm border border-red-300/30 dark:border-red-400/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100/50 dark:bg-yellow-500/20 backdrop-blur-sm border border-yellow-300/30 dark:border-yellow-400/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100/50 dark:bg-blue-500/20 backdrop-blur-sm border border-blue-300/30 dark:border-blue-400/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
    }
  };

  const getButtonClass = () => {
    switch (popup.type) {
      case 'success':
        return 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white';
      case 'error':
        return 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white';
      default:
        return 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-2 sm:p-4 bg-black/20 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md mx-2 sm:mx-4 transform transition-all duration-300 scale-100 max-h-[95vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            {getIcon()}
          </div>

          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white break-words">
              {popup.title}
            </h3>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words leading-relaxed">
              {popup.message}
            </p>

            {popup.showConfirm ? (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    if (onCancel) onCancel();
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 text-sm sm:text-base touch-manipulation"
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

