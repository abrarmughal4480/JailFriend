'use client';
import CustomTooltip from './CustomTooltip';
import { useState } from 'react';

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
  const handleReaction = (reactionType: ReactionType, e: React.MouseEvent | React.TouchEvent) => {
    // We don't stop propagation here anymore, so the click bubbles up to CustomTooltip
    // and toggles isVisible to false, closing the popup.

    // Call the onReaction callback
    onReaction(reactionType);
  };

  return (
    <CustomTooltip
      content={
        <div
          className="flex items-center gap-2 p-2 bg-slate-700 dark:bg-slate-700 rounded-full shadow-lg"
        >
          {reactions.map((reaction) => {
            const isCurrentReaction = currentReaction === reaction.type;
            return (
              <button
                key={reaction.type}
                onClick={(e) => {
                  e.preventDefault();
                  handleReaction(reaction.type, e);
                }}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-base sm:text-lg hover:scale-110 transition-all duration-200 touch-manipulation ${reaction.color
                  } ${isCurrentReaction
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
      placement="top-end"
    >
      {children}
    </CustomTooltip>
  );
}