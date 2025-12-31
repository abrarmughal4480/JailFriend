'use client';
import React, { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { ExternalLink } from 'lucide-react';

interface LinkPreviewProps {
    url: string;
}

interface Metadata {
    title: string;
    description: string;
    image: string;
    siteName: string;
    url: string;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ url }) => {
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                setLoading(true);
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
                const response = await fetch(`${apiUrl}/api/posts/link-preview?url=${encodeURIComponent(url)}`);

                if (response.ok) {
                    const data = await response.json();
                    setMetadata(data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Error fetching link preview:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPreview();
    }, [url]);

    if (loading) {
        return (
            <div className={`my-3 p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} animate-pulse`}>
                <div className="h-4 bg-gray-400 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
            </div>
        );
    }

    if (error || !metadata || (!metadata.title && !metadata.description)) {
        return null; // Don't show anything if it fails or there's no useful metadata
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block my-3 rounded-lg border overflow-hidden transition-all hover:shadow-md ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
        >
            {metadata.image && (
                <div className="relative h-48 w-full">
                    <img
                        src={metadata.image}
                        alt={metadata.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
            )}
            <div className="p-3">
                {metadata.siteName && (
                    <span className={`text-xs uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {metadata.siteName}
                    </span>
                )}
                <h4 className={`text-sm font-bold mt-1 line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {metadata.title}
                </h4>
                {metadata.description && (
                    <p className={`text-xs mt-1 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {metadata.description}
                    </p>
                )}
                <div className="flex items-center mt-2 text-[10px] text-blue-500 font-medium">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {new URL(url).hostname}
                </div>
            </div>
        </a>
    );
};

export default LinkPreview;
