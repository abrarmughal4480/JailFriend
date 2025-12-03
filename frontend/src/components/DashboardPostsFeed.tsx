'use client';
import { useState, useEffect, useMemo } from 'react';
import FeedPost from './FeedPost';
import AlbumDisplay from './AlbumDisplay';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface Post {
  _id: string;
  id?: string;
  content: string;
  title?: string;
  media?: any[];
  voice?: any;
  user?: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
  };
  userId?: string;
  createdAt: string;
  likes?: string[];
  likedBy?: string[];
  comments?: any[];
  shares?: string[];
  savedBy?: string[];
  views?: string[];
  type?: string;
  isPinned?: boolean;
  isBoosted?: boolean;
  commentsEnabled?: boolean;
  location?: any;
  poll?: any;
  sellData?: any;
  reactions?: any[];
}

interface Album {
  _id: string;
  title: string;
  description?: string;
  photos?: any[];
  user?: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
  };
  userId?: string;
  createdAt: string;
  likes?: string[];
  comments?: any[];
  shares?: string[];
  savedBy?: string[];
  views?: string[];
  type?: string;
}

interface DashboardPostsFeedProps {
  posts: Post[];
  albums: Album[];
  loadingPosts: boolean;
  loadingAlbums: boolean;
  activeFilter: string;
  deletingComments: { [key: string]: boolean };
  onLike: (postId: string) => Promise<void>;
  onReaction: (postId: string, reactionType: string) => Promise<void>;
  onComment: (postId: string, text: string) => Promise<void>;
  onShare: (postId: string, shareOptions?: any) => Promise<void>;
  onSave: (postId: string) => Promise<void>;
  onDelete: (postId: string) => void;
  onEdit: (post: Post) => void;
  onPostUpdate: (updatedPost: Post) => void;
  onWatch: (item: Post | Album) => void;
  onAlbumLike: (albumId: string) => Promise<void>;
  onAlbumReaction: (albumId: string, reactionType: string) => Promise<void>;
  onAlbumComment: (albumId: string, text: string) => Promise<void>;
  onAlbumDelete: (albumId: string) => void;
  onAlbumSave: (albumId: string) => Promise<void>;
  onAlbumShare: (albumId: string, shareOptions?: any) => Promise<void>;
}

const DashboardPostsFeed: React.FC<DashboardPostsFeedProps> = ({
  posts,
  albums,
  loadingPosts,
  loadingAlbums,
  activeFilter,
  deletingComments,
  onLike,
  onReaction,
  onComment,
  onShare,
  onSave,
  onDelete,
  onEdit,
  onPostUpdate,
  onWatch,
  onAlbumLike,
  onAlbumReaction,
  onAlbumComment,
  onAlbumDelete,
  onAlbumSave,
  onAlbumShare
}) => {
  const { isDarkMode } = useDarkMode();
  const getFilteredPosts = () => {
    if (activeFilter === 'all') {
      return posts;
    }

    return posts.filter(post => {
      switch (activeFilter) {
        case 'text':
          return !post.media || post.media.length === 0;
        case 'photos':
          return post.media && post.media.some((media: any) => media.type === 'image');
        case 'videos':
          return post.media && post.media.some((media: any) => media.type === 'video');
        case 'sounds':
          return post.voice || (post.media && post.media.some((media: any) => media.type === 'audio'));
        case 'files':
          return post.media && post.media.some((media: any) => media.type === 'file' || media.type === 'application');
        case 'maps':
          return post.location;
        default:
          return true;
      }
    });
  };

  const filteredPosts = getFilteredPosts();

  const combinedFeed = useMemo(() => {
    const feed = [
      ...filteredPosts.map((post: any) => ({ ...post, type: 'post' })),
      ...albums.map((album: any) => ({ ...album, type: 'album' }))
    ];

    // Shuffle the combined feed
    for (let i = feed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [feed[i], feed[j]] = [feed[j], feed[i]];
    }

    return feed;
  }, [filteredPosts, albums]);

  // Memoize current user to avoid repeated localStorage access
  const currentUser = useMemo(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        return {};
      }
    }
    return {};
  }, []);

  const renderFeed = useMemo(() => {
    if (combinedFeed.length === 0) {
      return (
        <div className="text-center py-8">
          <div className={`text-lg mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
            📭 No {activeFilter === 'all' ? '' : activeFilter} posts found
          </div>
          <div className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
            Try changing your filter or create a new post
          </div>
        </div>
      );
    }

    return combinedFeed.map((item: any, index: number) => {
      if (item.type === 'album') {
        return (
          <AlbumDisplay
            key={`album-${item._id}-${index}`}
            album={item}
            onDelete={onAlbumDelete}
            isOwner={false}
            onLike={onAlbumLike}
            onReaction={onAlbumReaction}
            onComment={onAlbumComment}
            onDeleteComment={() => { }}
            onSave={onAlbumSave}
            onShare={onAlbumShare}
            deletingComments={deletingComments}
            onWatch={onWatch}
          />
        );
      }

      const isOwnPost = item.user && (
        item.user._id === currentUser._id ||
        item.user.id === currentUser.id ||
        item.user.userId === currentUser.id
      );

      return (
        <FeedPost
          key={`post-${item._id || item.id}-${index}`}
          post={item}
          onLike={onLike}
          onReaction={onReaction}
          onComment={onComment}
          onShare={onShare}
          onSave={onSave}
          onDelete={onDelete}
          onEdit={onEdit}
          onPostUpdate={onPostUpdate}
          isOwnPost={isOwnPost}
          onWatch={onWatch}
        />
      );
    });
  }, [combinedFeed, currentUser, activeFilter, isDarkMode, onLike, onReaction, onComment, onShare, onSave, onDelete, onEdit, onPostUpdate, onWatch, onAlbumLike, onAlbumReaction, onAlbumComment, onAlbumDelete, onAlbumSave, onAlbumShare, deletingComments]);

  if (loadingPosts && loadingAlbums) {
    return (
      <div className="text-center py-6 sm:py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
        <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>Loading your feed...</p>
      </div>
    );
  }

  if (posts.length === 0 && albums.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">📱</div>
        <h3 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>No posts yet</h3>
        <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>Be the first to share something amazing!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderFeed}
    </div>
  );
};

export default DashboardPostsFeed;
