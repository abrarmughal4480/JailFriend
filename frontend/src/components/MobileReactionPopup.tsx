'use client';
import { useRef, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

interface MobileReactionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onReaction: (reactionType: ReactionType) => void;
  currentReaction?: ReactionType | null;
  isReacting?: boolean;
}

const reactions: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: 'like', emoji: '👍', label: 'Like', color: 'bg-blue-500' },
  { type: 'love', emoji: '❤️', label: 'Love', color: 'bg-red-500' },
  { type: 'haha', emoji: '😂', label: 'Haha', color: 'bg-yellow-500' },
  { type: 'wow', emoji: '😮', label: 'Wow', color: 'bg-yellow-500' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: 'bg-yellow-500' },
  { type: 'angry', emoji: '😠', label: 'Angry', color: 'bg-orange-500' }
];

export default function MobileReactionPopup({ 
  isOpen, 
  onClose, 
  onReaction, 
  currentReaction,
  isReacting
}: MobileReactionPopupProps) {
  const { isDarkMode } = useDarkMode();
  
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={popupRef}
      className="fixed inset-0 z-[99999] flex items-center justify-center sm:hidden"
      onClick={onClose}
    >
      {/* Glassmorphism Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm" />
      
      {/* Popup Container */}
      <div 
        className={`relative ${isDarkMode ? 'bg-gray-800/80 border-gray-600/20' : 'bg-white/80 border-white/20'} backdrop-blur-xl border rounded-2xl shadow-2xl mx-4 max-w-sm w-full transform transition-all duration-300 ease-out`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <h3 className="text-lg font-semibold text-gray-800 text-center">React</h3>
        </div>

        {/* Reactions */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-3">
            {reactions.map((reaction) => (
              <button
                key={reaction.type}
                onClick={() => {
                  onReaction(reaction.type);
                  onClose();
                }}
                disabled={isReacting}
                className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 touch-manipulation ${
                  currentReaction === reaction.type 
                    ? 'bg-blue-100/80 scale-105' 
                    : 'bg-gray-100/60 hover:bg-gray-200/80 active:bg-gray-300/80 hover:scale-105'
                } ${
                  isReacting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg shadow-lg transition-all duration-200 ${
                  reaction.color
                } ${
                  isReacting && currentReaction === reaction.type ? 'animate-pulse' : ''
                } ${
                  currentReaction === reaction.type ? 'ring-2 ring-blue-300 ring-offset-1' : ''
                } group-hover:scale-110`}>
                  {isReacting && currentReaction === reaction.type ? (
                    <div className="animate-spin rounded-full border-b-2 border-white h-4 w-4"></div>
                  ) : (
                    reaction.emoji
                  )}
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  currentReaction === reaction.type ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {reaction.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Cancel Button */}
        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-200/60 text-gray-700 rounded-xl font-medium hover:bg-gray-300/80 active:bg-gray-400/80 transition-all duration-200 touch-manipulation backdrop-blur-sm"
            style={{ touchAction: 'manipulation' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
