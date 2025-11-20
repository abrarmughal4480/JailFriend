'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Trash2, MessageCircle, ExternalLink, Pin, Zap } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface PostOptionsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComments: () => void;
  onOpenInNewTab: () => void;
  onPin: () => void;
  onBoost: () => void;
  commentsEnabled?: boolean;
  isPinned?: boolean;
  isBoosted?: boolean;
  position?: 'top' | 'bottom';
  isOwnPost?: boolean; // Add this prop to check if current user owns the post
}

const PostOptionsDropdown: React.FC<PostOptionsDropdownProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleComments,
  onOpenInNewTab,
  onPin,
  onBoost,
  commentsEnabled = true,
  isPinned = false,
  isBoosted = false,
  position = 'bottom',
  isOwnPost = false
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const ownerOptions = Boolean(isOwnPost) ? [
    {
      icon: <Edit3 className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`} />,
      title: "Edit Post",
      subtitle: "Edit post information.",
      onClick: onEdit,
      className: `${isDarkMode ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`
    },
    {
      icon: <Trash2 className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-red-300' : 'text-red-500'}`} />,
      title: "Delete Post",
      subtitle: "Delete this post completely.",
      onClick: onDelete,
      className: `${isDarkMode ? 'text-red-300 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`
    },
    {
      icon: <MessageCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`} />,
      title: commentsEnabled ? "Disable comments" : "Enable comments",
      subtitle: "Allow or disallow members to comment on this post.",
      onClick: onToggleComments,
      className: `${isDarkMode ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`
    }
  ] : [];
  
  const options = [
    // Owner-only options - only show if isOwnPost is true
    ...ownerOptions,
    {
      icon: <ExternalLink className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`} />,
      title: "Open post in new tab",
      subtitle: "View this post in a new tab.",
      onClick: onOpenInNewTab,
      className: `${isDarkMode ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`
    },

    {
      icon: <Pin className={`w-4 h-4 sm:w-5 sm:h-5 ${isPinned ? 'text-blue-400' : (isDarkMode ? 'text-gray-200' : 'text-gray-700')}`} />,
      title: isPinned ? "Unpin Post" : "Pin Post",
      subtitle: isPinned ? "Unpin this post from the top of your profile." : "Pin this post to the top of your profile.",
      onClick: onPin,
      className: isPinned
        ? `${isDarkMode ? 'text-blue-300 hover:bg-blue-900/20' : 'text-blue-600 hover:bg-blue-50'}`
        : `${isDarkMode ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`
    },
    {
      icon: <Zap className={`w-4 h-4 sm:w-5 sm:h-5 ${isBoosted ? 'text-yellow-300' : (isDarkMode ? 'text-gray-200' : 'text-gray-700')}`} />,
      title: isBoosted ? "Remove Boost" : "Boost Post",
      subtitle: isBoosted ? "Remove this post from the boosted list." : "Add this post from the boosted list.",
      onClick: onBoost,
      className: isBoosted
        ? `${isDarkMode ? 'text-yellow-300 hover:bg-yellow-900/20' : 'text-yellow-600 hover:bg-yellow-50'}`
        : `${isDarkMode ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`
    }
  ];

  return (
    <div
      ref={dropdownRef}
      className={`z-[9999] w-72 sm:w-80 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-2xl border overflow-hidden right-0
      ${position === 'top' ? 'sm:absolute sm:bottom-full sm:mb-3' : 'sm:absolute sm:top-full sm:mt-3'}
      fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:transform-none sm:top-auto sm:left-auto`}
      style={{
        maxWidth: 'calc(100vw - 2rem)',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
    >
      <div className="py-2">
        {options.map((option, index) => (
          <React.Fragment key={option.title}>
            <button
              onClick={() => {
                option.onClick();
                onClose();
              }}
              className={`w-full px-4 py-3 text-left transition-colors duration-150 ${option.className} rounded-none flex items-start gap-3`}
              style={{ touchAction: 'manipulation' }}
            >
              <div className={`flex-shrink-0 p-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                {option.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {option.title}
                </div>
                <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 leading-snug`}>
                  {option.subtitle}
                </div>
              </div>
            </button>
            {index < options.length - 1 && (
              <div className={`border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} mx-4`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default PostOptionsDropdown;
