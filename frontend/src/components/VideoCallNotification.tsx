'use client';

import { useState, useEffect } from 'react';
import { Phone, PhoneOff, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VideoCallNotificationProps {
    isVisible: boolean;
    callerName: string;
    callerId: string;
    callId: string;
    onAccept: () => void;
    onDecline: () => void;
    onClose: () => void;
}

const VideoCallNotification: React.FC<VideoCallNotificationProps> = ({
    isVisible,
    callerName,
    callerId,
    callId,
    onAccept,
    onDecline,
    onClose
}) => {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(30); // 30 seconds to answer

    useEffect(() => {
        if (!isVisible) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    onDecline(); // Auto decline after 30 seconds
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isVisible, onDecline]);

    useEffect(() => {
        if (isVisible) {
            setTimeLeft(30);
        }
    }, [isVisible]);

    const handleAccept = () => {
        onAccept();
        router.push(`/dashboard/video-call/${callId}?type=user&caller=${encodeURIComponent(callerName)}`);
    };

    const handleDecline = () => {
        onDecline();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Incoming Video Call</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Caller Info */}
                <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{callerName}</h2>
                    <p className="text-gray-600">is calling you...</p>
                </div>

                {/* Timer */}
                <div className="text-center mb-6">
                    <div className="text-sm text-gray-500">
                        Time remaining: <span className="font-semibold text-red-600">{timeLeft}s</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                    <button
                        onClick={handleDecline}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full h-12 flex items-center justify-center"
                    >
                        <PhoneOff className="w-5 h-5 mr-2" />
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full h-12 flex items-center justify-center"
                    >
                        <Phone className="w-5 h-5 mr-2" />
                        Accept
                    </button>
                </div>

                {/* Call ID for debugging */}
                <div className="text-xs text-gray-400 text-center mt-4">
                    Call ID: {callId}
                </div>
            </div>
        </div>
    );
};

export default VideoCallNotification;
