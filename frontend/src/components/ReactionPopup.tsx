'use client';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useRef } from 'react';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

interface ReactionPopupProps {
  children: React.ReactElement;
  onReaction: (reactionType: ReactionType) => void;
  currentReaction?: ReactionType | null;
  isDarkMode?: boolean;
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
  children,
  onReaction,
  currentReaction,
  isDarkMode = false
}: ReactionPopupProps) {
  const tippyInstanceRef = useRef<any>(null);

  const handleReaction = (reactionType: ReactionType, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Call the onReaction callback first
    onReaction(reactionType);
    
    // Hide the popup after a small delay to ensure the reaction is processed
    if (tippyInstanceRef.current) {
      setTimeout(() => {
        tippyInstanceRef.current?.hide();
      }, 100);
    }
  };

  return (
    <Tippy
      onCreate={(instance) => {
        tippyInstanceRef.current = instance;
      }}
      content={
        <div 
          className="flex items-center gap-2 p-2 bg-slate-700 dark:bg-slate-700 rounded-full"
          onClick={(e) => e.stopPropagation()}
        >
          {reactions.map((reaction) => {
            const isCurrentReaction = currentReaction === reaction.type;
            return (
              <button
                key={reaction.type}
                onClick={(e) => handleReaction(reaction.type, e)}
                onTouchEnd={(e) => handleReaction(reaction.type, e)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg hover:scale-110 transition-all duration-200 touch-manipulation ${
                  reaction.color
                } ${
                  isCurrentReaction 
                    ? `ring-2 ring-blue-300 ring-offset-1` 
                    : 'hover:shadow-md'
                }`}
                title={reaction.label}
                style={{ touchAction: 'manipulation' }}
              >
                {reaction.emoji}
              </button>
            );
          })}
        </div>
      }
      interactive={true}
      trigger="click"
      placement="top-start"
      arrow={false}
      zIndex={99999}
      offset={[0, 10]}
      hideOnClick={false}
      touch={true}
      appendTo={() => document.body}
      className="!bg-transparent !shadow-none !border-none !p-0"
      onClickOutside={(instance, event) => {
        instance.hide();
      }}
      popperOptions={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 10],
            },
          },
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['top-start', 'top', 'bottom-start', 'top-end'],
            },
          },
        ],
      }}
    >
      {children}
    </Tippy>
  );
}