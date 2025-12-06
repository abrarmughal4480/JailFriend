

'use client';
import React from 'react';

interface ReactionAvatarDisplayProps {
    likes?: any[];
    reactions?: any[];
    currentUserLike?: boolean; // If the current user liked it, we might want to include them if not in the list
}

const ReactionAvatarDisplay: React.FC<ReactionAvatarDisplayProps> = ({
    likes = [],
    reactions = [],
    currentUserLike = false
}) => {
    // Combine all unique users who reacted or liked
    const uniqueUsers = new Map();

    // Helper to get current user
    const getCurrentUser = () => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch {
            return null;
        }
    };

    // If current user liked, add them first (so they show up)
    if (currentUserLike) {
        const currentUser = getCurrentUser();
        if (currentUser && (currentUser._id || currentUser.id)) {
            uniqueUsers.set(currentUser._id || currentUser.id, currentUser);
        }
    }

    // Process likes
    likes.forEach(like => {
        if (typeof like === 'object' && like !== null && (like._id || like.id)) {
            uniqueUsers.set(like._id || like.id, like);
        }
    });

    // Process reactions
    reactions.forEach(reaction => {
        const user = reaction.user || reaction.userId;
        if (user && typeof user === 'object' && (user._id || user.id)) {
            uniqueUsers.set(user._id || user.id, user);
        }
    });

    const users = Array.from(uniqueUsers.values());

    // Calculate counts
    const unpopulatedLikesCount = likes.filter(l => typeof l === 'string').length;
    const unpopulatedReactionsCount = reactions.filter(r => {
        const u = r.user || r.userId;
        return typeof u === 'string';
    }).length;

    // Total interactions
    const totalCount = users.length + unpopulatedLikesCount + unpopulatedReactionsCount;

    if (totalCount === 0) return null;

    // Determine which avatars to show
    // We want to show up to 3 avatars.
    // Prioritize real users, then placeholders if needed.
    let displayAvatars: any[] = [...users];

    // If we don't have enough real users to fill 3 spots, and we have unpopulated counts,
    // we can add placeholders or just rely on the "+X" count.
    // However, the user issue is "no avatar circle" meaning just "+2".
    // This happens when displayAvatars is empty but totalCount > 0.

    // If we have NO real users but we have count, we should show generic avatars.
    const slotsNeeded = Math.min(3, totalCount);
    const realUsersAvailable = displayAvatars.length;

    // If we have fewer real users than slots needed, we fill with placeholders
    if (realUsersAvailable < slotsNeeded) {
        const placeholdersNeeded = slotsNeeded - realUsersAvailable;
        for (let i = 0; i < placeholdersNeeded; i++) {
            displayAvatars.push({ isPlaceholder: true, id: `placeholder-${i}` });
        }
    }

    // Slice to max 3
    const finalDisplay = displayAvatars.slice(0, 3);
    const remainingCount = totalCount - finalDisplay.length;

    const getMediaUrl = (url: string) => {
        if (!url) return '/default-avatar.svg';
        if (/^(https?:)?\/\//i.test(url) || /^(data:|blob:)/i.test(url)) return url;
        const api = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
        const normalized = (url.startsWith('/') ? url.slice(1) : url).replace(/\\/g, '/');
        return `${api}/${normalized}`.replace(/\s/g, '%20');
    };

    return (
        <div className="flex items-center -space-x-2 overflow-hidden">
            {finalDisplay.map((user, index) => (
                <img
                    key={user._id || user.id || user.id}
                    className="inline-block h-5 w-5 rounded-full ring-2 ring-white dark:ring-gray-800 object-cover bg-gray-200 dark:bg-gray-700"
                    src={user.isPlaceholder ? '/default-avatar.svg' : (user.avatar ? getMediaUrl(user.avatar) : '/default-avatar.svg')}
                    alt={user.name || 'User'}
                    onError={(e) => {
                        e.currentTarget.src = '/default-avatar.svg';
                    }}
                />
            ))}
            {remainingCount > 0 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-100 dark:bg-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-300 z-10">
                    +{remainingCount}
                </div>
            )}
        </div>
    );
};

export default ReactionAvatarDisplay;
