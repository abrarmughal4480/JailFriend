'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPostByIdApi } from '@/utils/api';
import FeedPost from '@/components/FeedPost';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { ArrowLeft } from 'lucide-react';
import { getCurrentUserId } from '@/utils/auth';

export default function PostPage() {
    const { postId } = useParams();
    const router = useRouter();
    const { isDarkMode } = useDarkMode();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPost = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }
            const data = await getPostByIdApi(token, postId as string);
            setPost(data);
        } catch (err: any) {
            console.error('Error fetching post:', err);
            setError(err.response?.data?.message || 'Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (postId) {
            fetchPost();
        }

        const handlePostUpdatedEvent = (event: any) => {
            if (event.detail && event.detail.postId === postId) {
                setPost(event.detail.updatedPost);
            }
        };

        window.addEventListener('postUpdated', handlePostUpdatedEvent);
        return () => {
            window.removeEventListener('postUpdated', handlePostUpdatedEvent);
        };
    }, [postId, router]);

    const handleLike = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) fetchPost();
        } catch (err) {
            console.error('Error liking post:', err);
        }
    };

    const handleComment = async (id: string, text: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/comment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
            if (response.ok) fetchPost();
        } catch (err) {
            console.error('Error commenting:', err);
        }
    };

    const handleSave = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/save`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) fetchPost();
        } catch (err) {
            console.error('Error saving post:', err);
        }
    };

    const handleShare = async (id: string, shareOptions: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/share`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(shareOptions)
            });
            if (response.ok) {
                alert('Post shared successfully!');
                fetchPost();
            }
        } catch (err) {
            console.error('Error sharing post:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                router.push('/dashboard');
            }
        } catch (err) {
            console.error('Error deleting post:', err);
        }
    };

    const handlePostUpdate = (updatedPost: any) => {
        setPost(updatedPost);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{error || 'Post not found'}</h2>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const currentUserId = getCurrentUserId();
    const isActuallyOwnPost = Boolean(
        post.user?._id === currentUserId ||
        post.user?.id === currentUserId ||
        post.user?.userId === currentUserId ||
        (typeof post.user?.userId === 'object' && post.user?.userId?._id === currentUserId)
    );

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-2xl mx-auto p-4">
                <button
                    onClick={() => router.back()}
                    className={`flex items-center gap-2 mb-6 p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back to Feed</span>
                </button>

                <FeedPost
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onEdit={(p) => {
                        // Edit functionality usually opens a modal, 
                        // for now we can just log or implement a redirect if there's an edit page
                        console.log('Edit post:', p);
                    }}
                    onPostUpdate={handlePostUpdate}
                    isOwnPost={isActuallyOwnPost}
                />
            </div>
        </div>
    );
}
