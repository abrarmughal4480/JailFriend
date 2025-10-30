'use client';

import socketService from './socketService';

interface VideoCallServiceProps {
    userId: string;
    userName: string;
    onIncomingCall: (callData: {
        callerId: string;
        callerName: string;
        callId: string;
    }) => void;
    onCallAccepted: (callId: string) => void;
    onCallDeclined: (callId: string) => void;
    onCallEnded: (callId: string) => void;
}

class VideoCallService {
    private userId: string;
    private userName: string;
    private onIncomingCall: (callData: any) => void;
    private onCallAccepted: (callId: string) => void;
    private onCallDeclined: (callId: string) => void;
    private onCallEnded: (callId: string) => void;
    private currentCallerId: string | null = null;

    constructor({
        userId,
        userName,
        onIncomingCall,
        onCallAccepted,
        onCallDeclined,
        onCallEnded
    }: VideoCallServiceProps) {
        this.userId = userId;
        this.userName = userName;
        this.onIncomingCall = onIncomingCall;
        this.onCallAccepted = onCallAccepted;
        this.onCallDeclined = onCallDeclined;
        this.onCallEnded = onCallEnded;
    }

    connect() {
        console.log('Video call service connecting...');
        console.log('Video call service user info:', { userId: this.userId, userName: this.userName });
        
        // Wait for socket to be ready
        const checkSocket = () => {
            const socket = socketService.getSocket();
            if (socket && socket.connected) {
                console.log('🎯 Video call service connected to existing socket');
                console.log('🎯 Socket ID:', socket.id);
                
                // Join video call service
                console.log('🎯 Joining video call service room for user:', this.userId);
                socket.emit('join-video-call-service', {
                    userId: this.userId,
                    userName: this.userName
                });

                // Set up event listeners
                socket.on('incoming-video-call', (data) => {
                    console.log('📹 Incoming video call received:', data);
                    console.log('📹 Current user ID:', this.userId);
                    console.log('📹 Receiver ID from call:', data.receiverId);
                    console.log('📹 Caller ID from call:', data.callerId);
                    
                    // Check if this call is for the current user
                    if (data.receiverId === this.userId) {
                        console.log('📹 This call is for the current user, processing...');
                        this.currentCallerId = data.callerId;
                        this.onIncomingCall(data);
                    } else {
                        console.log('📹 This call is not for the current user, ignoring...');
                    }
                });

                socket.on('video-call-accepted', (data) => {
                    console.log('📹 Video call accepted:', data);
                    this.onCallAccepted(data.callId);
                });

                socket.on('video-call-declined', (data) => {
                    console.log('📹 Video call declined:', data);
                    this.onCallDeclined(data.callId);
                });

                socket.on('video-call-ended', (data) => {
                    console.log('📹 Video call ended:', data);
                    this.onCallEnded(data.callId);
                });
            } else {
                console.log('Socket not ready, retrying in 1 second...');
                setTimeout(checkSocket, 1000);
            }
        };

        checkSocket();
    }

    disconnect() {
        const socket = socketService.getSocket();
        if (socket) {
            socket.off('incoming-video-call');
            socket.off('video-call-accepted');
            socket.off('video-call-declined');
            socket.off('video-call-ended');
        }
    }

    initiateCall(receiverId: string, receiverName: string) {
        const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        
        console.log('🎯 VideoCallService.initiateCall called:', {
            callerId: this.userId,
            callerName: this.userName,
            receiverId,
            receiverName,
            callId
        });
        
        const socket = socketService.getSocket();
        if (socket) {
            console.log('📡 Emitting initiate-video-call event to socket:', socket.id);
            socket.emit('initiate-video-call', {
                callerId: this.userId,
                callerName: this.userName,
                receiverId,
                receiverName,
                callId
            });
        } else {
            console.error('❌ No socket available for video call initiation');
        }

        return callId;
    }

    acceptCall(callId: string) {
        const socket = socketService.getSocket();
        if (socket && this.currentCallerId) {
            socket.emit('accept-video-call', {
                callId,
                receiverId: this.userId,
                receiverName: this.userName,
                callerId: this.currentCallerId
            });
        }
    }

    declineCall(callId: string) {
        const socket = socketService.getSocket();
        if (socket && this.currentCallerId) {
            socket.emit('decline-video-call', {
                callId,
                receiverId: this.userId,
                callerId: this.currentCallerId
            });
        }
    }

    endCall(callId: string) {
        const socket = socketService.getSocket();
        if (socket) {
            socket.emit('end-video-call', {
                callId,
                userId: this.userId
            });
        }
    }
}

export default VideoCallService;
