'use client';
import { useRef, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

interface ReactionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onReaction: (reactionType: ReactionType) => void;
  currentReaction?: ReactionType | null;
  position?: 'top' | 'bottom';
  isReacting?: boolean;
}

const reactions: { type: ReactionType; emoji: string; label: string; lightColor: string; darkColor: string }[] = [
  { type: 'like', emoji: '👍', label: 'Like', lightColor: 'bg-blue-500', darkColor: 'bg-blue-600' },
  { type: 'love', emoji: '❤️', label: 'Love', lightColor: 'bg-red-500', darkColor: 'bg-red-600' },
  { type: 'haha', emoji: '😂', label: 'Haha', lightColor: 'bg-yellow-500', darkColor: 'bg-yellow-600' },
  { type: 'wow', emoji: '😮', label: 'Wow', lightColor: 'bg-purple-500', darkColor: 'bg-purple-600' },
  { type: 'sad', emoji: '😢', label: 'Sad', lightColor: 'bg-gray-500', darkColor: 'bg-gray-600' },
  { type: 'angry', emoji: '😠', label: 'Angry', lightColor: 'bg-orange-500', darkColor: 'bg-orange-600' }
];

export default function ReactionPopup({ 
  isOpen, 
  onClose, 
  onReaction, 
  currentReaction,
  position = 'top',
  isReacting
}: ReactionPopupProps) {
  const { isDarkMode } = useDarkMode();
  
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
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

  return (
    <div 
      ref={popupRef}
      onMouseDown={(e) => {
        // Prevent outside mousedown listener from closing before click handlers run
        e.stopPropagation();
      }}
      className={`relative z-[99999] ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-full shadow-xl border p-3 pointer-events-auto max-w-sm mx-auto hidden sm:block`}
      style={{
        zIndex: 99999,
        position: 'relative',
        display: 'block',
        visibility: 'visible',
        opacity: 1
      }}
    >
      <div className="flex items-center gap-2">
        {reactions.map((reaction) => (
          <button
            key={reaction.type}
            onClick={(e) => {
              e.stopPropagation();
              onReaction(reaction.type);
              onClose();
            }}
            disabled={isReacting}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg hover:scale-110 transition-all duration-200 ${
              isDarkMode 
                ? `${reaction.darkColor} text-white` 
                : `${reaction.lightColor} text-white`
            } ${
              currentReaction === reaction.type 
                ? `${isDarkMode ? 'ring-2 ring-blue-400 ring-offset-1' : 'ring-2 ring-blue-300 ring-offset-1'}` 
                : 'hover:shadow-md'
            } ${
              isReacting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
            title={isReacting ? 'Processing...' : reaction.label}
          >
            {isReacting ? (
              <div className={`animate-spin rounded-full border-b-2 h-4 w-4 ${isDarkMode ? 'border-white' : 'border-white'}`}></div>
            ) : (
              <span className="text-xl" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                {reaction.emoji}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
} 
