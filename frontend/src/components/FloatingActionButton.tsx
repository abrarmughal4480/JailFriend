"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Image, Megaphone, Users, Flag } from 'lucide-react';

interface FloatingActionButtonProps {
  isAdminPage?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ isAdminPage = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
    setShowPopup(!showPopup);
  };

  const handleCreateAlbum = () => {
    setShowPopup(false);
    setIsOpen(false);
    // Navigate to album creation page
    window.location.href = '/dashboard/albums';
  };

  const handleCreateAdvertisement = () => {
    setShowPopup(false);
    setIsOpen(false);
    // Navigate to advertisement creation page
    window.location.href = '/dashboard/advertising';
  };

  const handleCreateGroup = () => {
    setShowPopup(false);
    setIsOpen(false);
    // Navigate to group creation page
    window.location.href = '/dashboard/groups';
  };

  const handleCreatePage = () => {
    setShowPopup(false);
    setIsOpen(false);
    // Navigate to page creation page
    window.location.href = '/dashboard/pages';
  };

  // Don't show FAB on admin pages
  if (isAdminPage) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className={`flex fixed bottom-24 right-4 md:bottom-24 md:right-24 lg:bottom-6 lg:right-24 w-14 h-14 rounded-full shadow-lg transition-all duration-300 z-[70] lg:z-50 items-center justify-center touch-manipulation ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-gray-700 hover:bg-gray-800'
        }`}
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Popup Menu */}
      {showPopup && (
        <div
          ref={popupRef}
          className="fixed bottom-36 right-4 md:bottom-36 md:right-24 lg:bottom-24 lg:right-24 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[70] lg:z-50 min-w-[220px]"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }}
        >
          {/* Popup Arrow */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45"></div>
          
          {/* Menu Items */}
          <div className="p-2">
            {/* Create Album */}
            <button
              onClick={handleCreateAlbum}
              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors group"
            >
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                <Image className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Create album</span>
            </button>
            
            {/* Create Advertisement */}
            <button
              onClick={handleCreateAdvertisement}
              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors group"
            >
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                <Megaphone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Create advertisement</span>
            </button>

            {/* Create New Group */}
            <button
              onClick={handleCreateGroup}
              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors group"
            >
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Create New Group</span>
            </button>

            {/* Create New Page */}
            <button
              onClick={handleCreatePage}
              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors group"
            >
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                <Flag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Create New Page</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingActionButton; 
