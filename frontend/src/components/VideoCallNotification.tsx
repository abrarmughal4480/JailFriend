'use client';

import { useState, useEffect } from 'react';
import { Phone, PhoneOff, X, User, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VideoCallNotificationProps {
    isVisible: boolean;
    callerName: string;
    callerId: string;
    callId: string;
    callerAvatar?: string;
    onAccept: () => void;
    onDecline: () => void;
    onClose: () => void;
}

const VideoCallNotification: React.FC<VideoCallNotificationProps> = ({
    isVisible,
    callerName,
    callerId,
    callId,
    callerAvatar,
    onAccept,
    onDecline,
    onClose
}) => {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(30);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (!isVisible) return;

        setIsAnimating(true);
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    onDecline();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
            setIsAnimating(false);
        };
    }, [isVisible, onDecline]);

    useEffect(() => {
        if (isVisible) {
            setTimeLeft(30);
        }
    }, [isVisible]);

    const handleAccept = () => {
        setIsAnimating(false);
        onAccept();
        router.push(`/dashboard/video-call/${callId}?type=user&caller=${encodeURIComponent(callerName)}`);
    };

    const handleDecline = () => {
        setIsAnimating(false);
        onDecline();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-500 ${
                isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Incoming Call
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Caller Info */}
                <div className="px-6 pb-6">
                    <div className="text-center">
                        {/* Avatar */}
                        <div className="relative mb-4">
                            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-green-500 shadow-lg">
                                {callerAvatar ? (
                                    <img 
                                        src={callerAvatar} 
                                        alt={callerName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            (e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty('display', 'flex');
                                        }}
                                    />
                                ) : null}
                                <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold ${
                                    callerAvatar ? 'hidden' : 'flex'
                                }`}>
                                    {callerName.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            {/* Ring animation */}
                            <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-75"></div>
                        </div>

                        {/* Caller Name */}
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {callerName}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Video Call Request
                        </p>
                    </div>

                    {/* Timer */}
                    <div className="mt-6 mb-6">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>Auto-decline in</span>
                            <span className="font-bold text-red-500 text-lg">{timeLeft}s</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <button
                            onClick={handleDecline}
                            className="flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-2xl h-14 flex items-center justify-center space-x-2 font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                        >
                            <PhoneOff className="w-5 h-5" />
                            <span>Decline</span>
                        </button>
                        <button
                            onClick={handleAccept}
                            className="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-2xl h-14 flex items-center justify-center space-x-2 font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                        >
                            <Phone className="w-5 h-5" />
                            <span>Accept</span>
                        </button>
                    </div>

                    {/* Call Info */}
                    <div className="mt-4 text-center">
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                            Call ID: {callId.slice(0, 8)}...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCallNotification;
