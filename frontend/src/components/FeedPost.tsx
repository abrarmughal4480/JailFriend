'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Share2, ChevronDown, Smile, Paperclip, Send, MoreHorizontal, Globe } from 'lucide-react';
import PostOptionsDropdown from './PostOptionsDropdown';
import ReactionPopup, { ReactionType } from './ReactionPopup';
import { toggleCommentsApi, pinPostApi, boostPostApi } from '@/utils/api';
import SharePopup, { ShareOptions } from './SharePopup';
import { getCurrentUserId } from '@/utils/auth';
import LocationDisplay from './LocationDisplay';

interface FeedPostProps {
  post: any;
  onLike: (postId: string) => void;
  onReaction?: (postId: string, reactionType: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string, shareOptions: ShareOptions) => void;
  onSave: (postId: string) => void;
  onDelete: (postId: string) => void;
  onEdit: (post: any) => void;
  onPostUpdate?: (updatedPost: any) => void;
  isOwnPost: boolean;
  onWatch?: (post: any) => void;
}

const FeedPost: React.FC<FeedPostProps> = ({
  post,
  onLike,
  onReaction,
  onComment,
  onShare,
  onSave,
  onDelete,
  onEdit,
  onPostUpdate,
  isOwnPost,
  onWatch
}) => {
  

  const router = useRouter();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [reactionButtonHovered, setReactionButtonHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [isTogglingComments, setIsTogglingComments] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<{[key: string]: boolean}>({});

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const mediaPickerRef = useRef<HTMLDivElement>(null);
  const reactionButtonRef = useRef<HTMLButtonElement>(null);
  const reactionPopupWrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (mediaPickerRef.current && !mediaPickerRef.current.contains(event.target as Node)) {
        setShowMediaPicker(false);
      }
      
      if (showReactionPopup) {
        const buttonEl = reactionButtonRef.current;
        const popupEl = reactionPopupWrapperRef.current;
        const targetNode = event.target as Node;
        const clickInsideButton = !!(buttonEl && buttonEl.contains(targetNode));
        const clickInsidePopup = !!(popupEl && popupEl.contains(targetNode));
        if (!clickInsideButton && !clickInsidePopup) {
          setShowReactionPopup(false);
        }
      }
    };

  
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showReactionPopup]);

  const getMediaUrl = (url: string) => {
    if (!url) return '/default-avatar.svg';
    if (/^(https?:)?\/\//i.test(url) || /^(data:|blob:)/i.test(url)) return url;
    const api = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    const normalized = (url.startsWith('/') ? url.slice(1) : url).replace(/\\/g, '/');
    return `${api}/${normalized}`.replace(/\s/g, '%20');
  };

  const getUserAvatar = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.avatar) {
        if (user.avatar.includes('localhost:3000')) {
          const correctedUrl = user.avatar.replace('http://localhost:3000', 'https://jaifriend-frontend-n6zr.vercel.app');
          return correctedUrl;
        }
        
        // Handle avatar URLs properly
        if (user.avatar.includes('/avatars/') || user.avatar.includes('/covers/')) {
          // For avatar paths, construct the full URL
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
          if (user.avatar.startsWith('http')) {
            return user.avatar;
          }
          return `${baseUrl}/${user.avatar}`;
        }
        
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
        if (user.avatar.startsWith('http')) {
          return user.avatar;
        }
        return `${baseUrl}/${user.avatar}`;
      }
      return '/default-avatar.svg';
    } catch {
      return '/default-avatar.svg';
    }
  };

  const handleComment = () => {
    if (commentText.trim()) {
      onComment(post._id, commentText);
      setCommentText('');
      setShowCommentInput(false);
    }
  };

  const handleCommentLike = (commentId: string) => {
    console.log('Like comment:', commentId);
  };

  const handleCommentReply = (commentId: string, userName: string) => {
    setCommentText(`@${userName} `);
    const input = document.querySelector('input[placeholder="Write a comment and press enter"]') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  };

  const handleReaction = async (reactionType: ReactionType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add a reaction.');
        return;
      }

      setIsReacting(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post._id}/reaction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reactionType: reactionType
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Reaction updated successfully:', data);
        
      
        if (onPostUpdate) {
          if (data.post) {
            onPostUpdate(data.post);
          } else {
        
            console.log('API response missing post data, refreshing page...');
            window.location.reload();
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update reaction:', errorData);
        alert(`Failed to update reaction: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error adding reaction:', error);
      
      let errorMessage = 'Error adding reaction. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      alert(errorMessage);
    } finally {
      setIsReacting(false);
      setShowReactionPopup(false);
    }
  };

  const updateReactionCount = (newCount: number) => {

  };


  const isPostSaved = (): boolean => {
    try {
      const currentUserId = getCurrentUserId();
      
      if (!currentUserId) {
        return false;
      }
      
      if (!post.savedBy) {
        return false;
      }
      

      const isSaved = Array.isArray(post.savedBy) && post.savedBy.some((savedUser: string | { _id?: string; id?: string; userId?: string }) => {
        let savedUserId: string | undefined;
        
        if (typeof savedUser === 'object' && savedUser !== null) {
   
          savedUserId = savedUser._id || savedUser.id || savedUser.userId;
        } else {
        
          savedUserId = savedUser;
        }
        
     
        const matches = savedUserId === currentUserId || savedUserId?.toString() === currentUserId?.toString();
        return matches;
      });
      
      return isSaved;
    } catch (error) {
      console.error('Error checking if post is saved:', error);
      return false;
    }
  };

  const handleEdit = () => {
    onEdit(post);
    setShowOptionsDropdown(false);
  };

 
  const handleToggleComments = async () => {
    try {
      setIsTogglingComments(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to perform this action');
        return;
      }

      const response = await toggleCommentsApi(token, post._id);

      if (response.message) {
        // Refresh the page to show updated state
        window.location.reload();
      } else {
        alert('Failed to toggle comments');
      }
    } catch (error) {
      console.error('Error toggling comments:', error);
      alert('Error toggling comments');
    } finally {
      setIsTogglingComments(false);
      setShowOptionsDropdown(false);
    }
  };

  const handleOpenInNewTab = () => {
    const postUrl = `${window.location.origin}/dashboard/post/${post._id}`;
    window.open(postUrl, '_blank');
    setShowOptionsDropdown(false);
  };

  const handlePin = async () => {
    try {
      setIsPinning(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to perform this action');
        return;
      }

      console.log('📌 Pinning/unpinning post:', post._id);
      const response = await pinPostApi(token, post._id);

      if (response.message) {
        console.log('✅ Pin response:', response);
     
        const updatedPost = { ...post, isPinned: response.isPinned };
        
        window.dispatchEvent(new CustomEvent('postUpdated', { 
          detail: { postId: post._id, updatedPost } 
        }));
        
        // Show success message
        alert(response.message);
      } else {
        alert('Failed to pin/unpin post');
      }
    } catch (error) {
      console.error('Error pinning/unpinning post:', error);
      alert('Error pinning/unpinning post');
    } finally {
      setIsPinning(false);
      setShowOptionsDropdown(false);
    }
  };

  // Handle boost/unboost post
  const handleBoost = async () => {
    try {
      setIsBoosting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to perform this action');
        return;
      }

      console.log('🚀 Boosting/unboosting post:', post._id);
      const response = await boostPostApi(token, post._id);

      if (response.message) {
        console.log('✅ Boost response:', response);
        // Update the post state locally instead of reloading
        const updatedPost = { ...post, isBoosted: response.isBoosted };
        
        // Dispatch event to update parent component
        window.dispatchEvent(new CustomEvent('postUpdated', { 
          detail: { postId: post._id, updatedPost } 
        }));
        
        // Show success message
        alert(response.message);
      } else {
        alert('Failed to boost/unboost post');
      }
    } catch (error) {
      console.error('Error boosting/unboosting post:', error);
      alert('Error boosting/unboosting post');
    } finally {
      setIsBoosting(false);
      setShowOptionsDropdown(false);
    }
  };

  // Handle save/unsave post
  const handleSave = async () => {
    try {
      if (!onSave) {
        alert('Save functionality not available');
        return;
      }
      
      onSave(post._id);
      setShowOptionsDropdown(false);
    } catch (error) {
      console.error('Error in handleSave:', error);
      alert('Error saving/unsaving post');
    }
  };

  // Handle delete post
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      onDelete(post._id);
      setShowOptionsDropdown(false);
    }
  };


  const handleReview = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add a review.');
        return;
      }

      // For now, we'll just show an alert. In a real app, you'd open a review modal
      const rating = prompt('Rate this post (1-5 stars):');
      if (rating && !isNaN(Number(rating)) && Number(rating) >= 1 && Number(rating) <= 5) {
        const reviewText = prompt('Write your review (optional):');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post._id}/review`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rating: Number(rating),
            text: reviewText || ''
          })
        });

        if (response.ok) {
          alert('Review added successfully!');
          // Refresh the post data or update the UI
          window.location.reload();
        } else {
          alert('Failed to add review. Please try again.');
        }
      } else if (rating !== null) {
        alert('Please enter a valid rating between 1 and 5.');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Error adding review. Please try again.');
    }
  };

  // Handle poll voting
  const handlePollVote = async (optionIndex: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to vote in polls.');
        return;
      }

      // Check if user has already voted
      if (post.poll.userVote && post.poll.userVote.includes(optionIndex)) {
        // Remove vote
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post._id}/poll/vote`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ optionIndex })
        });

        if (response.ok) {
          // Update local state to reflect vote removal
          const updatedPost = { ...post };
          if (updatedPost.poll.userVote) {
            updatedPost.poll.userVote = updatedPost.poll.userVote.filter((vote: number) => vote !== optionIndex);
          }
          // Update the post state to reflect changes
          if (onPostUpdate) {
            onPostUpdate(updatedPost);
          }
        }
      } else {
        // Add vote
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post._id}/poll/vote`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ optionIndex })
        });

        if (response.ok) {
          const data = await response.json();
          // Update local state with the new poll data
          const updatedPost = { ...post };
          updatedPost.poll = data.poll;
          // Update the post state to reflect changes
          if (onPostUpdate) {
            onPostUpdate(updatedPost);
          }
        } else {
          alert('Failed to vote. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error voting in poll:', error);
      alert('Error voting in poll. Please try again.');
    }
  };



  const getCurrentReaction = (): ReactionType | null => {
    // Check if user has any reaction on this post
    if (post.reactions && post.reactions.length > 0) {
      // Find user's reaction
      const userReaction = post.reactions.find((r: any) => {
        const currentUserId = getCurrentUserId();
        return r.user === currentUserId || r.userId === currentUserId || r.user?._id === currentUserId;
      });
      return userReaction ? userReaction.type : null;
    }
    return null;
  };

  // Get emoji for specific reaction type
  const getReactionEmoji = (reactionType: ReactionType): string => {
    const reactionEmojis: { [key: string]: string } = {
      'like': '👍',
      'love': '❤️',
      'haha': '😂',
      'wow': '😮',
      'sad': '😢',
      'angry': '😠'
    };
    
    return reactionEmojis[reactionType] || '👍';
  };

  // Get text for specific reaction type
  const getReactionText = (reactionType: ReactionType): string => {
    const reactionTexts: { [key: string]: string } = {
      'like': 'Like',
      'love': 'Love',
      'haha': 'Haha',
      'wow': 'Wow',
      'sad': 'Sad',
      'angry': 'Angry'
    };
    
    return reactionTexts[reactionType] || 'React';
  };

  const getMostCommonReactionEmoji = (): string => {
    if (!post.reactions || post.reactions.length === 0) return '👍';
    
    const reactionCounts: { [key: string]: number } = {};
    post.reactions.forEach((reaction: any) => {
      reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
    });
    
    const mostCommon = Object.keys(reactionCounts).reduce((a, b) => 
      reactionCounts[a] > reactionCounts[b] ? a : b
    );
    
    return getReactionEmoji(mostCommon as ReactionType);
  };

  // Get reaction count
  const getReactionCount = (): number => {
    if (post.reactions && Array.isArray(post.reactions)) {
      return post.reactions.length;
    }
    // Fallback to likes count for backward compatibility
    return post.likes ? (Array.isArray(post.likes) ? post.likes.length : post.likes) : 0;
  };

  const startEditComment = (comment: any) => {
    setEditingCommentId(comment._id || comment.id);
    setEditCommentText(comment.text || comment.content || '');
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const saveEditComment = async (commentId: string) => {
    if (!editCommentText.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again to edit comments.');
        return;
      }

      console.log('Editing comment:', { commentId, editCommentText, postId: post._id });
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post._id}/comment/${commentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: editCommentText })
      });
      
      console.log('Edit response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Edit success data:', data);
        
        // Update the comment in the post
        const updatedPost = { ...post };
        const commentIndex = updatedPost.comments.findIndex((c: any) => (c._id || c.id) === commentId);
        if (commentIndex !== -1) {
          updatedPost.comments[commentIndex] = data.comment;
          // Trigger parent component update
          window.dispatchEvent(new CustomEvent('postUpdated'));
        }
        cancelEditComment();
        // Show success message
        alert('Comment updated successfully!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Edit failed:', errorData);
        alert(`Failed to update comment: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to edit comment:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    setDeletingCommentId(commentId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again to delete comments.');
        setDeletingCommentId(null);
        return;
      }

      console.log('Deleting comment:', { commentId, postId: post._id });
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post._id}/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Delete response status:', res.status);
      
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        console.log('Delete success data:', data);
        
        // Remove the comment from the post
        const updatedPost = { ...post };
        updatedPost.comments = updatedPost.comments.filter((c: any) => (c._id || c.id) !== commentId);
        // Trigger parent component update
        window.dispatchEvent(new CustomEvent('postUpdated'));
        // Show success message
        alert('Comment deleted successfully!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Delete failed:', errorData);
        alert(`Failed to delete comment: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleShare = () => {
    setShowSharePopup(true);
  };

  const handleShareConfirm = (shareOptions: ShareOptions) => {
    onShare(post._id, shareOptions);
    setShowSharePopup(false);
  };

  const navigateToProfile = () => {
    let userId = '';
    
    // Handle populated user object (when userId is the full user object)
    if (post.user?.userId && typeof post.user.userId === 'object' && post.user.userId._id) {
      userId = post.user.userId._id;
    } else {
      userId = post.user?.userId || post.user?._id || post.user?.id;
    }
    
    if (userId) {
      router.push(`/dashboard/profile/${userId}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  // Get current user ID for like checking
  const currentUserId = getCurrentUserId();
  const isLiked = post.likes?.includes(currentUserId);

  // Calculate total reactions (likes + other reactions if they exist)
  const totalReactions = (post.likes?.length || 0) + (post.reactions?.length || 0);

  const handleMediaUpload = async (type: 'photo' | 'video' | 'file') => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
    setShowMediaPicker(false); // Close media picker after file input is clicked
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('postId', post._id);
    formData.append('originalName', file.name); // Ensure original filename is sent
    formData.append('fileSize', file.size.toString()); // Send file size
    formData.append('fileType', file.type); // Send MIME type

    setIsUploading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to upload media.');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/post-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Media uploaded successfully:', data);
        alert('Media uploaded successfully!');
        // Refresh the post data or update the UI
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Media upload failed:', errorData);
        alert(`Failed to upload media: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network error during media upload:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
      event.target.value = ''; // Clear the file input
    }
  };

  // Toggle post content expansion
  const togglePostExpansion = (postId: string) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const extractVideoLinks = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex) || [];
    
    return urls.filter(url => {
    
      if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) return true;
   
      if (url.includes('vimeo.com/')) return true;
    
      if (url.includes('facebook.com/') && url.includes('video')) return true;
     
      if (url.includes('instagram.com/') && url.includes('reel')) return true;
      
      if (url.includes('tiktok.com/')) return true;
      return false;
    });
  };

  
  const getVideoEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes('youtube.com/watch')) {
      const videoId = url.match(/v=([^&]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('/')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    // Facebook (basic support)
    if (url.includes('facebook.com/')) {
      return url.replace('www.facebook.com', 'www.facebook.com/plugins/video.php');
    }
    // Instagram (basic support)
    if (url.includes('instagram.com/')) {
      return url;
    }
    // TikTok (basic support)
    if (url.includes('tiktok.com/')) {
      return url;
    }
    return null;
  };

  const renderContentWithVideos = (content: string) => {
 
    if (content.includes('<pre')) {
 
      const preMatch = content.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
      if (preMatch) {
        const preContent = preMatch[1];
        return (
          <div className="whitespace-pre-wrap break-words font-sans bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
            {preContent}
          </div>
        );
      }
    }
    
    const videoLinks = extractVideoLinks(content);
    
    if (videoLinks.length === 0) {
      return renderContentWithLinks(content);
    }

    let parts = [content];
    videoLinks.forEach(url => {
      parts = parts.flatMap(part => {
        if (typeof part === 'string') {
          return part.split(url);
        }
        return [part];
      });
    });

    return (
      <div>
        {parts.map((part, index) => {
          if (videoLinks.includes(part)) {
            const embedUrl = getVideoEmbedUrl(part);
            if (embedUrl) {
              return (
                <div key={index} className="my-3">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      🎥 Video Link: {part}
                    </div>
                    {embedUrl.includes('youtube.com/embed') || embedUrl.includes('vimeo.com') ? (
                      <iframe
                        src={embedUrl}
                        width="100%"
                        height="200"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="bg-gray-200 dark:bg-gray-600 rounded-lg p-4 text-center">
                        <div className="text-lg mb-2">🎬</div>
                        <a 
                          href={part} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Click to view video
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          }
          return renderContentWithLinks(part);
        })}
      </div>
    );
  };


  const renderContentWithLinks = (content: string) => {
  
    if (content.includes('<pre')) {
   
      const preMatch = content.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
      if (preMatch) {
        const preContent = preMatch[1];
        return (
          <div className="whitespace-pre-wrap break-words font-sans bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
            {preContent}
          </div>
        );
      }
    }
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
   
        if (extractVideoLinks(part).length > 0) {
          return <span key={index}>{part}</span>;
        }
        
        return (
          <div key={index} className="my-2">
            <a
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {part}
            </a>
            <div className="mt-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <div className="text-lg">🔗</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {new URL(part).hostname}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Click to visit link
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (part.trim() === '') return null;
      
      // Split by double line breaks to create paragraphs
      const paragraphs = part.split(/\n\n+/);
      
      return (
        <div key={index}>
          {paragraphs.map((paragraph, pIndex) => {
            if (paragraph.trim() === '') return null;
            
            // Split by single line breaks within paragraphs
            const lines = paragraph.split(/\n/);
            
            return (
              <div key={pIndex} className="mb-3">
                {lines.map((line, lineIndex) => {
                  if (line.trim() === '') return null;
                  
                  // Check if line starts with emoji or special characters
                  const hasEmoji = /^[🚩✨✅💬🔴🟡🟢🔵⚫🟣🟠⚪🟤]/.test(line.trim());
                  const isBulletPoint = /^[•·▪▫‣⁃]/.test(line.trim());
                  
                  return (
                    <div key={lineIndex} className={`${lineIndex > 0 ? 'mt-2' : ''} ${hasEmoji || isBulletPoint ? 'flex items-start gap-2' : ''}`}>
                      {hasEmoji || isBulletPoint ? (
                        <>
                          <span className="text-lg flex-shrink-0">{line.trim().charAt(0)}</span>
                          <span className="flex-1">{line.trim().substring(1)}</span>
                        </>
                      ) : (
                        <span>{line}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-3 sm:mb-4 transition-colors duration-200">
      {/* Promoted Post Indicator - Show when post has reactions/likes */}
      {(() => {
        const hasReactions = post.reactions && post.reactions.length > 0;
        const hasLikes = post.likes && post.likes.length > 0;
        const totalEngagement = (post.reactions?.length || 0) + (post.likes?.length || 0);
        
        if (totalEngagement === 0) return null;
        
        let badgeType = 'PROMOTED POST';
        let badgeColor = 'bg-orange-400';
        let badgeIcon = '⭐';
        
       
        if (totalEngagement >= 10) {
          badgeType = 'TRENDING POST';
          badgeColor = 'bg-purple-500';
          badgeIcon = '🔥';
        } else if (totalEngagement >= 5) {
          badgeType = 'POPULAR POST';
          badgeColor = 'bg-blue-500';
          badgeIcon = '🚀';
        } else if (hasReactions && hasLikes) {
          badgeType = 'ENGAGED POST';
          badgeColor = 'bg-green-500';
          badgeIcon = '💫';
        }
        
        return (
          <div className="px-3 sm:px-4 pt-3 sm:pt-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <div className={`inline-flex items-center px-3 py-1.5 ${badgeColor} text-white text-xs font-semibold rounded-full shadow-sm transform hover:scale-105 transition-transform`}>
                <span className="mr-1">{badgeIcon}</span>
                {badgeType}
              </div>
              
              {/* Engagement Count */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">{totalEngagement}</span> {totalEngagement === 1 ? 'engagement' : 'engagements'}
              </div>
            </div>
          </div>
        );
      })()}
      
    
      <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
          
            <div className="relative">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                onClick={navigateToProfile}
              >
                <img
                  src={post.user?.avatar ? getMediaUrl(post.user.avatar) : '/default-avatar.svg'}
                  alt={post.user?.name || 'User'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.svg';
                  }}
                />
              </div>
              {/* Online Status Indicator */}
              <div className="absolute bottom-0 left-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div 
                  className="font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 transition-colors text-sm sm:text-base truncate"
                  onClick={navigateToProfile}
                >
                  {post.user?.name || 'User'}
                </div>
                {/* Verified Badge */}
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <span>{formatDate(post.createdAt)}</span>
                
                {/* Pin indicator */}
                {post.isPinned && (
                  <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                    <span className="text-xs sm:text-sm">📌</span>
                    <span className="text-xs">Pinned</span>
                  </div>
                )}
                
                {/* Boost indicator */}
                {post.isBoosted && (
                  <div className="flex items-center space-x-1 text-purple-600 dark:text-purple-400">
                    <span className="text-xs sm:text-sm">🚀</span>
                    <span className="text-xs">Boosted</span>
                  </div>
                )}
                
                {/* Reel indicator */}
                {post.type === 'reel' && (
                  <div className="flex items-center space-x-1 text-red-500 dark:text-red-400">
                    <span className="text-xs sm:text-sm">🎬</span>
                    <span className="text-xs">Reel</span>
                  </div>
                )}
                
                <Globe className="w-2 h-2 sm:w-3 sm:h-3" />
                {post.isShared && (
                  <span className="text-blue-600 text-xs">📤 Shared</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Options Dropdown */}
          {isOwnPost && (
            <div className="relative">
              <button
                onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </button>
              
              <PostOptionsDropdown
                isOpen={showOptionsDropdown}
                onClose={() => setShowOptionsDropdown(false)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComments={handleToggleComments}
                onOpenInNewTab={handleOpenInNewTab}
                onPin={handlePin}
                onBoost={handleBoost}
                commentsEnabled={post.commentsEnabled !== false}
                isPinned={post.isPinned}
                isBoosted={post.isBoosted}
                position="bottom"
                isOwnPost={isOwnPost}
              />
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="p-3 sm:p-4">
        {/* Title for posts and reels - Display first */}
        {post.title && (
          <div className="mb-2 sm:mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {post.title}
            </h3>
          </div>
        )}
        
        {/* Fallback title for reels without titles */}
        {post.type === 'reel' && !post.title && (
          <div className="mb-2 sm:mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white text-gray-500">
              Untitled Reel
            </h3>
          </div>
        )}
        

        
        {/* Content with word limit and Read More */}
        <div 
          className="text-gray-900 dark:text-white text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 cursor-pointer"
          onClick={() => onWatch && onWatch(post)}
        >
          {(() => {
            const content = post.content || '';
            const preMatchForPreview = content.includes('<pre') ? content.match(/<pre[^>]*>([\s\S]*?)<\/pre>/) : null;
            const plainTextForPreview = (preMatchForPreview ? preMatchForPreview[1] : content).replace(/<[^>]+>/g, '');
            const wordCount = plainTextForPreview.split(/\s+/).filter((word: string) => word && word.length > 0).length;
            const postId = post._id || post.id;
            const isExpanded = expandedPosts[postId] || false;
            
                
                if (wordCount > 50) {
                  // Smart truncation that respects paragraph boundaries
                  const smartTruncate = (text: string, maxWords: number) => {
                    const words = text.split(/\s+/);
                    if (words.length <= maxWords) return text;
                    
                  
                    let truncatedWords = words.slice(0, maxWords);
                 
                    let truncatedText = truncatedWords.join(' ');
                    
                
                    const breakPatterns = [
                        /[.!?]\s*$/,          
                      /\n\n\s*$/,           
                      /[•·▪▫‣⁃]\s*$/,      
                      /\n\s*$/,             
                      /\s*$/,               
                    ];
                    
                    let foundBreak = false;
                    for (const pattern of breakPatterns) {
                      if (pattern.test(truncatedText)) {
                        foundBreak = true;
                        break;
                      }
                    }
                      
                      // If no natural break found, try to find the last complete sentence
                    if (!foundBreak) {
                      const lastSentenceMatch = truncatedText.match(/.*[.!?]\s*$/);
                      if (lastSentenceMatch) {
                        truncatedText = lastSentenceMatch[0];
                      }
                    }
                    
                    if (truncatedText.length >= text.length * 0.9) { 
                      // Force truncation to be more aggressive
                      const forceTruncateWords = Math.floor(maxWords * 0.7); 
                      const forcedWords = words.slice(0, forceTruncateWords);
                      truncatedText = forcedWords.join(' ');
                      
                     
                      for (const pattern of breakPatterns) {
                        const match = truncatedText.match(new RegExp(`.*${pattern.source}`));
                        if (match) {
                          truncatedText = match[0];
                          break;
                        }
                      }
                    }
                    
                    
                    return truncatedText;
                  };
              
              const lines = plainTextForPreview.split('\n');
              const maxLines = 4; 
              const truncatedContentPlain = lines.slice(0, maxLines).join('\n');
              
              return (
                <div className="relative">
                  <div>{isExpanded ? renderContentWithVideos(content) : (
                    <div className="break-words whitespace-pre-wrap">{truncatedContentPlain}</div>
                  )}</div>
                  {!isExpanded && (
                    <span className="text-gray-500 dark:text-gray-400">...</span>
                  )}
                  <span 
                    className="text-blue-600 cursor-pointer ml-1 font-medium inline-flex items-center gap-1" 
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePostExpansion(postId);
                    }}
                    title={isExpanded ? "Show less" : "Read more"}
                  >
                    {isExpanded ? (
                      <>
                        <span>Show Less</span>
                        <span className="text-xs">▲</span>
                      </>
                    ) : (
                      <>
                        <span>Read More</span>
                        <span className="text-xs">▼</span>
                      </>
                    )}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">({wordCount} words)</span>
                </div>
              );
            } else {
              return renderContentWithVideos(content);
            }
          })()}
        </div>
        
        {/* Location Display - Show only once after content */}
        {post.location && post.location.name && post.location.address && (
          <div className="mb-3 sm:mb-4">
            <LocationDisplay 
              location={{
                name: post.location.name || 'Unknown Location',
                address: post.location.address || post.location.formatted_address || 'Location',
                coordinates: {
                  latitude: post.location.coordinates?.lat || post.location.coordinates?.latitude || 0,
                  longitude: post.location.coordinates?.lng || post.location.coordinates?.longitude || 0
                },
                country: post.location.country,
                state: post.location.state,
                city: post.location.city,
                postalCode: post.location.postalCode,
                timezone: post.location.timezone,
                isp: post.location.isp,
                ip: post.location.ip,
                source: post.location.source
              }}
              compact={true}
              showCoordinates={false}
            />
          </div>
        )}
        
        {/* Poll Display - Only show if poll was actually created */}
        {post.poll && post.poll.question && post.poll.options && post.poll.options.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <div className="mb-2">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">
                📊 {post.poll.question}
              </h4>
              <div className="space-y-2">
                {post.poll.options.map((option: any, index: number) => {
                  const totalVotes = post.poll.totalVotes || 0;
                  const optionVotes = option.voteCount || 0;
                  const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                  const isVoted = post.poll.userVote && post.poll.userVote.includes(index);
                  
                  return (
                    <div key={index} className="relative">
                      <button
                        onClick={() => handlePollVote(index)}
                        className={`w-full text-left p-2 rounded-lg border transition-all duration-200 ${
                          isVoted 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{option.text}</span>
                          <span className="text-xs">
                            {optionVotes} votes ({percentage}%)
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Total votes: {post.poll.totalVotes || 0}
                {post.poll.expiresAt && (
                  <span className="ml-2">
                    • Expires: {new Date(post.poll.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Feeling Display - Only show if feeling was actually selected */}
        {post.feeling && post.feeling.type && post.feeling.emoji && post.feeling.description && (
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{post.feeling.emoji}</span>
              <div>
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Feeling {post.feeling.description}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Intensity: {post.feeling.intensity}/10
                </p>
              </div>
            </div>
          </div>
        )}
        

        
        {/* Sell Info Display - Only show if sell info was actually added */}
        {post.sell && post.sell.productName && post.sell.price && (
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏪</span>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    {post.sell.productName}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Condition: {post.sell.condition}
                    {post.sell.negotiable && <span className="ml-2">• Price negotiable</span>}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${post.sell.price}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {post.sell.currency || 'USD'}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* GIF Display - Only show if GIF was actually selected */}
        {post.gif && post.gif.url && post.gif.url !== 'undefined' && (
          <div className="mb-3 sm:mb-4">
            <img 
              src={post.gif.url} 
              alt="GIF"
              className="w-full max-h-96 rounded-lg object-contain"
            />
          </div>
        )}
        
        {/* Voice Recording Display - Only show if voice was actually recorded */}
        {post.voice && post.voice.url && post.voice.duration && (
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎤</span>
              <div className="flex-1">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">
                  Voice Message
                </h4>
                <audio controls className="w-full">
                  <source src={post.voice.url} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Duration: {post.voice.duration}s
                  {post.voice.transcription && (
                    <span className="ml-2">• Transcription: {post.voice.transcription}</span>
                  )}
                  {post.voice.originalName && (
                    <span className="ml-2">• File: {post.voice.originalName}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="mb-3 sm:mb-4">
            {post.media.map((media: any, index: number) => {
              const rawUrl = typeof media === 'string' 
                ? media 
                : (media?.secure_url || media?.url || media?.path || '');
              const resolvedUrl = getMediaUrl(rawUrl);
              return (
              <div key={index} className="mb-2 cursor-pointer" onClick={() => onWatch && onWatch(post)}>
                {media.type === 'video' ? (
                  <video
                    src={resolvedUrl}
                    controls
                    className="w-full rounded-lg object-contain"
                    style={{ maxHeight: '80vh' }}
                  />
                ) : media.type === 'audio' ? (
                  <div className="mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎵</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {media.originalName || media.filename || media.name || 'Audio File'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {media.size ? `${(media.size / 1024 / 1024).toFixed(1)}MB` : 'Size unknown'}
                        </p>
                      </div>
                      <audio
                        src={resolvedUrl}
                        controls
                        className="w-full"
                      />
                    </div>
                  </div>
                ) : media.type === 'file' || media.type === 'document' ? (
                  <div 
                    className="mb-2 cursor-pointer"
                    onClick={() => {
                      // For PDFs and other files, open in new tab with absolute URL
                      if (media.mimetype?.includes('pdf') || media.mimetype?.includes('text') || media.mimetype?.includes('image')) {
                        let absoluteUrl = getMediaUrl(media.url);
                        // Fallback: if a PDF was uploaded as image on Cloudinary older posts may be under /image/upload
                        // Rewrite to /raw/upload to make Cloudinary serve it as a document
                        if (absoluteUrl.toLowerCase().endsWith('.pdf') && absoluteUrl.includes('/image/upload/')) {
                          absoluteUrl = absoluteUrl.replace('/image/upload/', '/raw/upload/');
                        }
                        try {
                          window.open(absoluteUrl, '_blank');
                        } catch (error) {
                          // Fallback to download
                          const link = document.createElement('a');
                          link.href = absoluteUrl;
                          link.download = media.originalName || media.filename || media.name || 'download';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {media.mimetype?.includes('pdf') ? '📕' : 
                         media.mimetype?.includes('word') || media.mimetype?.includes('doc') ? '📘' : 
                         media.mimetype?.includes('excel') || media.mimetype?.includes('xls') ? '📗' : 
                         media.mimetype?.includes('powerpoint') || media.mimetype?.includes('ppt') ? '📙' :
                         media.mimetype?.includes('text') ? '📝' : '📄'}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {media.originalName || media.filename || media.name || 'Document'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {media.size ? `${(media.size / 1024 / 1024).toFixed(1)}MB` : 'Size unknown'}
                          {media.extension && ` • ${media.extension.toUpperCase()}`}
                          {media.mimetype && ` • ${media.mimetype.split('/')[1]?.toUpperCase()}`}
                        </p>
                      </div>
                      
                    </div>
                  </div>
                ) : (
                  <img
                    src={resolvedUrl}
                    alt="Post media"
                    className="w-full rounded-lg object-contain hover:opacity-90 transition-opacity"
                    style={{ maxHeight: '80vh' }}
                    loading="lazy"
                    onError={(e) => {
                      if (rawUrl && e.currentTarget.src !== rawUrl) e.currentTarget.src = rawUrl;
                    }}
                  />
                )}
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons - Matching the image structure */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        {/* Top Section: Engagement Metrics */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-0 mb-3 sm:mb-4">
          {/* Right Side: Engagement Metrics */}
          <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
              </svg>
              <span className="text-xs sm:text-sm">{post.comments?.length || 0} Comments</span>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
              <span className="text-xs sm:text-sm">{post.views?.length || 0} Views</span>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="text-xs sm:text-sm">{post.reviews?.length || 0} Reviews</span>
            </div>
          </div>
        </div>
        
        {/* Removed temporary reaction display */}

        {/* Single Reaction Display - Shows all reactions like Jaifriend */}
        {post.reactions && Array.isArray(post.reactions) && post.reactions.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-600">
            <div className="flex flex-wrap gap-2">
              {(() => {
                const reactionCounts: { [key: string]: number } = {};
                post.reactions.forEach((reaction: any) => {
                  reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
                });
                
                const reactionEmojis: { [key: string]: string } = {
                  'like': '👍',
                  'love': '❤️',
                  'haha': '😂',
                  'wow': '😮',
                  'sad': '😢',
                  'angry': '😠'
                };
                
                return Object.entries(reactionCounts).map(([type, count]) => (
                  <div key={type} className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/20 rounded-full px-3 py-1 border border-blue-200 dark:border-blue-700">
                    <span className="text-lg">{reactionEmojis[type] || '😊'}</span>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{count}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Bottom Section: Action Buttons */}
        <div className="flex items-center justify-start md:justify-between py-3 sm:py-4 md:py-6 px-2 sm:px-4 md:px-6">
          <div className="flex items-center space-x-4 sm:space-x-8 md:space-x-16">
            {/* Reaction Button */}
            <div className="relative">
              {/* Main Reaction Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle click on all devices
                  setShowReactionPopup(!showReactionPopup);
                }}
                onTouchStart={(e) => {
                  // Don't call preventDefault on passive events
                  e.stopPropagation();
                }}
                onTouchEnd={(e) => {
                  // Don't call preventDefault on passive events
                  e.stopPropagation();
                  // Handle touch on mobile devices
                  setShowReactionPopup(!showReactionPopup);
                }}
                disabled={isReacting}
                className="flex flex-col items-center space-y-1 sm:space-y-2 md:space-y-3 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ touchAction: 'manipulation' }}
                ref={reactionButtonRef}
              >
                {/* Reaction Button - Same size as other buttons */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  {isReacting ? (
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 border-b-2 border-red-500"></div>
                  ) : (
                    <span className="text-lg sm:text-xl md:text-2xl">
                      👍
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm md:text-base font-medium text-gray-600 hover:text-pink-600 transition-colors">
                  {isReacting ? 'Processing...' : (getCurrentReaction() ? getReactionText(getCurrentReaction()!) : 'Like')}
                </span>
              </button>
              

              
              {/* Reaction Popup */}
              {showReactionPopup && (
                <div 
                  ref={reactionPopupWrapperRef} 
                  className="absolute bottom-full left-0 mb-2 z-[99999] pointer-events-auto"
                  style={{
                    // Ensure visibility on mobile
                    zIndex: 99999,
                    position: 'absolute'
                  }}
                >
                  <ReactionPopup
                    isOpen={showReactionPopup}
                    onClose={() => setShowReactionPopup(false)}
                    onReaction={handleReaction}
                    currentReaction={getCurrentReaction()}
                    position="top"
                    isReacting={isReacting}
                  />
                </div>
              )}
            </div>
            
            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex flex-col items-center space-y-1 sm:space-y-2 md:space-y-3 text-gray-600 dark:text-white hover:text-blue-600 transition-colors touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-xs sm:text-sm md:text-base font-medium">Comment</span>
            </button>
            
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center space-y-1 sm:space-y-2 md:space-y-3 text-gray-600 dark:text-white hover:text-green-600 transition-colors touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                </svg>
              </div>
              <span className="text-xs sm:text-sm md:text-base font-medium">Share</span>
            </button>
            
            {/* Review Button */}
            <button
              onClick={handleReview}
              className="flex flex-col items-center space-y-1 sm:space-y-2 md:space-y-3 text-gray-600 dark:text-white hover:text-yellow-600 transition-colors touch-manipulation px-1"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <span className="text-xs sm:text-sm md:text-base font-medium whitespace-nowrap">Review</span>
            </button>
            
            {/* Save Button */}
            <button
              onClick={handleSave}
              className="flex flex-col items-center space-y-1 sm:space-y-2 md:space-y-3 text-gray-600 dark:text-white hover:text-purple-600 transition-colors touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors ${
                isPostSaved() 
                  ? 'bg-purple-100 dark:bg-gray-900/20 text-purple-600 dark:text-purple-400' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill={isPostSaved() ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm md:text-base font-medium">{isPostSaved() ? 'Saved' : 'Save'}</span>
            </button>
          </div>
          
          {/* Right side - Empty for balance on desktop */}
          <div className="hidden md:block w-16 sm:w-20"></div>
        </div>

        {/* Remove the old reaction popup section since we moved it above */}

        {/* Comment Input - Only Show When Comments Are Visible */}
        {showComments && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
              <img
                src={getUserAvatar()}
                alt="Your avatar"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = '/default-avatar.svg';
                }}
              />
              <div className="flex-1 w-full">
                <div className="flex flex-col space-y-3">
                  {/* Comment Input */}
                  <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg px-3 py-2 shadow-sm border border-gray-200 dark:border-gray-600">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment and press enter"
                      className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              />
                <div className="flex items-center space-x-2 ml-2">
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="text-gray-400 hover:text-blue-500 p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" 
                    title="Add emoji"
                  >
                    😊
                  </button>
                  <button 
                    onClick={() => setShowMediaPicker(!showMediaPicker)}
                        className="text-gray-400 hover:text-green-500 p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" 
                    title="Add media"
                  >
                    📷
                  </button>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        Post Comment
                      </button>
                      <button
                        onClick={() => {
                          setCommentText('');
                          setShowEmojiPicker(false);
                          setShowMediaPicker(false);
                        }}
                        className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-sm"
                      >
                        Cancel
              </button>
            </div>
              </div>
            </div>
            
            {/* Emoji Picker */}
            {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="mt-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-lg">
                <div className="grid grid-cols-8 gap-2">
                  {['😊', '😂', '❤️', '👍', '🎉', '🔥', '😍', '🤔', '😭', '😡', '😱', '🥳', '😎', '🤗', '😴', '🤫'].map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCommentText(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-2xl hover:scale-110 transition-transform p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Media Picker */}
            {showMediaPicker && (
                  <div ref={mediaPickerRef} className="mt-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button 
                        onClick={() => handleMediaUpload('photo')}
                        disabled={isUploading}
                        className="flex flex-col items-center space-y-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors group"
                      >
                        <span className="text-2xl">📷</span>
                        <span className="text-sm font-medium">Photo</span>
                        <span className="text-xs opacity-80">JPG, PNG, GIF</span>
                        {isUploading && <span className="text-xs animate-pulse">Uploading...</span>}
                  </button>
                      <button 
                        onClick={() => handleMediaUpload('video')}
                        disabled={isUploading}
                        className="flex flex-col items-center space-y-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors group"
                      >
                        <span className="text-2xl">🎥</span>
                        <span className="text-sm font-medium">Video</span>
                        <span className="text-xs opacity-80">MP4, MOV, AVI</span>
                        {isUploading && <span className="text-xs animate-pulse">Uploading...</span>}
                  </button>
                      <button 
                        onClick={() => handleMediaUpload('file')}
                        disabled={isUploading}
                        className="flex flex-col items-center space-y-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors group"
                      >
                        <span className="text-2xl">📁</span>
                        <span className="text-sm font-medium">File</span>
                        <span className="text-xs opacity-80">PDF, DOC, ZIP</span>
                        {isUploading && <span className="text-xs animate-pulse">Uploading...</span>}
                  </button>
                    </div>
                    
                    {/* File Upload Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,.pdf,.doc,.docx,.zip,.rar"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {/* Upload Progress */}
                    {isUploading && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          <span className="text-sm text-blue-600 dark:text-blue-400">Uploading media...</span>
                </div>
              </div>
            )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Comments Display - Only Show When Comments Are Visible */}
        {showComments && post.comments && post.comments.length > 0 && (
          <div className="mt-4 space-y-4">
            {post.comments.slice(0, 3).map((comment: any, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <img
                  src={comment.user?.avatar ? getMediaUrl(comment.user.avatar) : '/default-avatar.svg'}
                  alt={comment.user?.name || 'User'}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.svg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                      {comment.user?.name || comment.user?.username || 'User'}
                    </span>
                    {comment.user?.verified && (
                      <span className="text-red-500 text-xs">✓</span>
                    )}
                  </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                      {formatDate(comment.createdAt || comment.date)}
                    </span>
                  </div>
                  
                  {editingCommentId === (comment._id || comment.id) ? (
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 mb-3 border border-gray-200 dark:border-gray-600">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <input
                          type="text"
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              saveEditComment(comment._id || comment.id);
                            } else if (e.key === 'Escape') {
                              cancelEditComment();
                            }
                          }}
                          className="flex-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Edit your comment..."
                          autoFocus
                        />
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <button
                          onClick={() => saveEditComment(comment._id || comment.id)}
                          disabled={!editCommentText.trim()}
                            className="flex-1 sm:flex-none px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditComment}
                            className="flex-1 sm:flex-none px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-700 rounded-lg px-4 py-3 mb-3 relative group border border-gray-200 dark:border-gray-600">
                      <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 pr-20">
                        {comment.text || comment.content}
                      </div>
                      
                      {/* Edit/Delete Icons - Positioned to the right */}
                      {(() => {
                        const currentUserId = getCurrentUserId();
                        const commentUserId = comment.user?._id || comment.user?.id || comment.user?.userId;
                        const canEdit = currentUserId && commentUserId && (
                          comment.user?._id === currentUserId || 
                          comment.user?.id === currentUserId || 
                          comment.user?.userId === currentUserId
                        );
                        
                        return canEdit;
                      })() && (
                        <div className="absolute top-3 right-3 flex items-center space-x-2">
                          <button
                            onClick={() => startEditComment(comment)}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Edit comment"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteComment(comment._id || comment.id)}
                            disabled={deletingCommentId === (comment._id || comment.id)}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                            title="Delete comment"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Comment Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <button 
                      onClick={() => handleCommentLike(comment._id || comment.id)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-1"
                    >
                      <span>👍</span>
                      <span>Like</span>
                      {comment.likes && comment.likes.length > 0 && (
                        <span className="text-xs">({comment.likes.length})</span>
                      )}
                    </button>
                    <button 
                      onClick={() => handleCommentReply(comment._id || comment.id, comment.user?.name || 'User')}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-1"
                    >
                        <span>💬</span>
                        <span>Reply</span>
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* View All Comments Button */}
            {post.comments.length > 3 && (
              <div className="text-center pt-2">
                <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors">
                View all {post.comments.length} comments
              </button>
              </div>
            )}
          </div>
        )}
        
        {/* Show Message When No Comments */}
        {showComments && (!post.comments || post.comments.length === 0) && (
          <div className="mt-4 text-center text-gray-500 dark:text-gray-400 text-sm p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            No comments yet. Be the first to comment! 💬
          </div>
        )}
      </div>

      {/* Share Popup */}
      {showSharePopup && (
        <SharePopup
          isOpen={showSharePopup}
          onClose={() => setShowSharePopup(false)}
          onShare={handleShareConfirm}
          postContent={post.content}
          postMedia={post.media}
        />
      )}
    </div>
  );
};

export default FeedPost; 