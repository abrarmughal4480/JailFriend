'use client';

/**
 * Manual reconnection utility for video calls
 * This can be called from anywhere in the app to trigger a reconnection
 */
export const triggerVideoCallReconnection = (): void => {
    console.log('🔄 Manual reconnection triggered');
    
    // Dispatch custom event that the WebRTC hook will listen to
    const event = new CustomEvent('connection-reconnect', {
        detail: {
            manual: true,
            timestamp: Date.now()
        }
    });
    
    window.dispatchEvent(event);
};

/**
 * Check if video call is currently reconnecting
 */
export const isVideoCallReconnecting = (): boolean => {
    // This would need to be implemented with a global state management solution
    // For now, we'll return false as a placeholder
    return false;
};

/**
 * Get current reconnection status
 */
export const getVideoCallReconnectionStatus = (): {
    isReconnecting: boolean;
    attempt: number;
    maxAttempts: number;
} => {
    // This would need to be implemented with a global state management solution
    // For now, we'll return default values as a placeholder
    return {
        isReconnecting: false,
        attempt: 0,
        maxAttempts: 5
    };
};
