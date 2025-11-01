'use client';
import { useState, useRef, useEffect } from 'react';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

interface ReactionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onReaction: (reactionType: ReactionType) => void;
  currentReaction?: ReactionType | null;
  position?: 'top' | 'bottom';
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

export default function ReactionPopup({ 
  isOpen, 
  onClose, 
  onReaction, 
  currentReaction,
  position = 'top',
  isReacting
}: ReactionPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Add a delay before enabling click outside detection
    // This prevents immediate closure when opening the popup
    let timeoutId: NodeJS.Timeout | null = null;
    
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside the popup
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        
        // Don't close if clicking on a button (reaction button)
        const clickedButton = target.closest('button');
        if (clickedButton) {
          // Check if it's a reaction button by looking at its parent structure
          const buttonParent = clickedButton.closest('.relative');
          if (buttonParent) {
            // Likely the reaction button container, don't close
            return;
          }
        }
        
        // Otherwise, close the popup
        onClose();
      }
    };

    if (isOpen) {
      // Longer delay to prevent immediate closure when opening
      timeoutId = setTimeout(() => {
        // Only use mousedown - not touchstart to avoid conflicts
        document.addEventListener('mousedown', handleClickOutside);
      }, 500); // 500ms delay - enough time for the popup to fully appear
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
      onTouchStart={(e) => {
        // Prevent outside touchstart listener from closing before touch handlers run
        e.stopPropagation();
      }}
      className={`relative z-[99999] bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-600 p-3 pointer-events-auto max-w-sm mx-auto`}
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
            onTouchEnd={(e) => {
              // Don't call preventDefault on passive events
              e.stopPropagation();
              onReaction(reaction.type);
              onClose();
            }}
            disabled={isReacting}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg hover:scale-110 transition-all duration-200 touch-manipulation ${
              reaction.color
            } ${
              currentReaction === reaction.type 
                ? `ring-2 ring-blue-300 ring-offset-1` 
                : 'hover:shadow-md'
            } ${
              isReacting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={isReacting ? 'Processing...' : reaction.label}
            style={{ touchAction: 'manipulation' }}
          >
            {isReacting ? (
              <div className={`animate-spin rounded-full border-b-2 border-white ${
                isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5'
              }`}></div>
            ) : (
              reaction.emoji
            )}
          </button>
        ))}
      </div>
    </div>
  );
} 
