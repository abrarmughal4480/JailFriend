import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import socketService from '@/services/socketService';
import ConnectionMonitor from '@/utils/connectionMonitor';

// TypeScript interfaces
interface User {
    _id: string;
    email: string;
    role: string;
    company?: string;
    firstName: string;
    lastName: string;
}

interface AuthData {
    userId: string;
    email: string;
    role: string;
    company?: string;
    firstName: string;
    lastName: string;
}

interface WebRTCHookProps {
    isAdmin: boolean;
    roomId: string;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    user?: User | null;
}

interface WebRTCHookReturn {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    socket: Socket | null;
    socketConnection: React.MutableRefObject<Socket | null>;
    handleDisconnect: (shouldRedirect?: boolean) => void;
    startPeerConnection: () => Promise<void>;
    isConnected: boolean;
    connectionState: 'connecting' | 'connected' | 'failed';
    handleVideoPlay: () => void;
    showVideoPlayError: boolean;
    isReconnecting: boolean;
    reconnectionAttempt: number;
    maxReconnectionAttempts: number;
}

const peerConfig: RTCConfiguration = {
    iceTransportPolicy: "all",
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun.l.google.com:5349" },
        { urls: "stun:stun1.l.google.com:3478" },
        { urls: "stun:stun1.l.google.com:5349" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:5349" },
        { urls: "stun:stun3.l.google.com:3478" },
        { urls: "stun:stun3.l.google.com:5349" },
        { urls: "stun:stun4.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:5349" },
        {
            urls: "turn:relay1.expressturn.com:3480",
            username: "174776437859052610",
            credential: "ZKziYTYdi6V/oRdHNuUn/INQkq4=",
        },
        {
            urls: "turn:relay1.expressturn.com:3480?transport=tcp",
            username: "174776437859052610",
            credential: "ZKziYTYdi6V/oRdHNuUn/INQkq4=",
        }
    ]
}

// Simple mobile detection function
const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
};

const useWebRTC = ({ isAdmin, roomId, videoRef, user = null }: WebRTCHookProps): WebRTCHookReturn => {
    const currentUser: User | null = user;
    
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const socketConnection = useRef<Socket | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'failed'>('connecting');
    const localStreamRef = useRef<MediaStream | null>(null);
    const [showVideoPlayError, setShowVideoPlayError] = useState<boolean>(false);
    const router = useRouter();
    const isMobile = isMobileDevice();
    const answerProcessed = useRef<boolean>(false);
    const processedMessages = useRef<Set<string>>(new Set());

    const peerConnectionStarted = useRef<boolean>(false);
    const isInitialized = useRef<boolean>(false);
    const roomJoinedRef = useRef<boolean>(false);
    
    // Pulse system for connection monitoring
    const pulseInterval = useRef<NodeJS.Timeout | null>(null);
    const pulseTimeout = useRef<NodeJS.Timeout | null>(null);
    const lastPulseReceived = useRef<number>(Date.now());
    const pulseIntervalMs = 5000; // Send pulse every 5 seconds
    const pulseTimeoutMs = 15000; // Consider disconnected if no pulse for 15 seconds
    
    // Connection monitoring and reconnection state
    const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
    const [reconnectionAttempt, setReconnectionAttempt] = useState<number>(0);
    const [maxReconnectionAttempts] = useState<number>(5);
    const connectionMonitorRef = useRef<ConnectionMonitor | null>(null);

    // Pulse system functions
    const startPulseSystem = (): void => {
        console.log('💓 Starting pulse system for video call monitoring');
        
        // Clear any existing pulse intervals
        stopPulseSystem();
        
        // Send initial pulse
        sendPulse();
        
        // Set up regular pulse sending
        pulseInterval.current = setInterval(() => {
            sendPulse();
        }, pulseIntervalMs);
        
        // Set up pulse timeout monitoring
        pulseTimeout.current = setInterval(() => {
            checkPulseTimeout();
        }, pulseIntervalMs);
    };

    const stopPulseSystem = (): void => {
        console.log('💓 Stopping pulse system');
        
        if (pulseInterval.current) {
            clearInterval(pulseInterval.current);
            pulseInterval.current = null;
        }
        
        if (pulseTimeout.current) {
            clearInterval(pulseTimeout.current);
            pulseTimeout.current = null;
        }
    };

    const sendPulse = (): void => {
        if (socketConnection.current && socketConnection.current.connected) {
            const pulseData = {
                roomId: roomId,
                userId: currentUser?._id || 'unknown',
                timestamp: Date.now(),
                isAdmin: isAdmin,
                connectionState: connectionState
            };
            
            console.log('💓 Sending pulse:', pulseData);
            socketConnection.current.emit('video-call-pulse', pulseData);
        }
    };

    const checkPulseTimeout = (): void => {
        const now = Date.now();
        const timeSinceLastPulse = now - lastPulseReceived.current;
        
        if (timeSinceLastPulse > pulseTimeoutMs) {
            console.log('💓 Pulse timeout detected - user may be disconnected');
            console.log(`Time since last pulse: ${timeSinceLastPulse}ms (timeout: ${pulseTimeoutMs}ms)`);
            
            // Trigger reconnection
            triggerReconnection();
        }
    };

    const handlePulseReceived = (pulseData: any): void => {
        console.log('💓 Pulse received from other user:', pulseData);
        lastPulseReceived.current = Date.now();
        
        // Update connection state based on pulse
        if (pulseData.connectionState === 'connected') {
            setIsConnected(true);
            setConnectionState('connected');
        }
    };

    const setupWebRTCEventListeners = (): void => {
        if (!socketConnection.current) {
            console.log('No socket connection available for event listeners');
            return;
        }
        
        console.log('Setting up WebRTC event listeners');
        
        socketConnection.current.on('offer', (offer: RTCSessionDescriptionInit) => {
            // Create a unique message ID based on offer content
            const messageId = `offer-${offer.sdp?.substring(0, 50)}`;
            
            console.log('🔍 DEBUG: Received offer:', { 
                isAdmin, 
                offerType: offer.type,
                roomId: roomId,
                socketId: socketConnection.current?.id,
                offerSdpPreview: offer.sdp?.substring(0, 50) + '...',
                messageId: messageId
            });
            
            // Check if we've already processed this offer
            if (processedMessages.current.has(messageId)) {
                console.log('Offer already processed, skipping duplicate');
                return;
            }
            
            processedMessages.current.add(messageId);
            handleOffer(offer);
        });
        
        socketConnection.current.on('answer', (answer: RTCSessionDescriptionInit) => {
            // Create a unique message ID based on answer content
            const messageId = `answer-${answer.sdp?.substring(0, 50)}`;
            
            console.log('🔍 DEBUG: Received answer:', { 
                isAdmin, 
                answerType: answer.type,
                roomId: roomId,
                socketId: socketConnection.current?.id,
                messageId: messageId
            });
            
            // Check if we've already processed this answer
            if (processedMessages.current.has(messageId)) {
                console.log('Answer already processed, skipping duplicate');
                return;
            }
            
            processedMessages.current.add(messageId);
            handleAnswer(answer);
        });
        
        socketConnection.current.on('ice-candidate', (candidate: RTCIceCandidateInit) => {
            console.log('🔍 DEBUG: Received ICE candidate:', { 
                isAdmin, 
                candidateType: candidate.candidate,
                roomId: roomId,
                socketId: socketConnection.current?.id
            });
            handleIceCandidate(candidate);
        });

        // Handle connection ready events for better synchronization
        socketConnection.current.on('video-call-invitation-sent', (data: any) => {
            console.log('📹 Video call invitation sent confirmation:', data);
            // This helps the caller know the invitation was delivered
        });

        socketConnection.current.on('user-joined-video-service', (data: any) => {
            console.log('📹 User joined video service:', data);
            // This helps coordinate when both users are ready
        });

        socketConnection.current.on('video-call-accepted', (data: any) => {
            console.log('📹 Video call accepted notification received:', data);
            // This helps the caller know the call was accepted
        });

        socketConnection.current.on('start-video-connection', (data: any) => {
            console.log('📹 Start video connection signal received:', data);
            // This triggers the receiver to start their connection immediately
            if (!isAdmin && isInitialized.current) {
                console.log('🎯 Receiver starting connection due to acceptance signal');
                setTimeout(() => {
                    startPeerConnection();
                }, 500); // Small delay to ensure everything is ready
            }
        });

        // Add offer retry mechanism
        socketConnection.current.on('offer-retry', (data: any) => {
            console.log('📹 Offer retry signal received:', data);
            if (isAdmin && isInitialized.current) {
                console.log('🎯 Admin retrying offer due to retry signal');
                setTimeout(() => {
                    // Retry sending the offer
                    if (peerConnectionRef.current && peerConnectionRef.current.localDescription) {
                        const offer = peerConnectionRef.current.localDescription;
                        console.log('🔍 DEBUG: Retrying offer to room:', {
                            roomId: roomId,
                            offerType: offer.type,
                            socketId: socketConnection.current?.id
                        });
                        socketConnection.current?.emit('offer', offer, roomId);
                    }
                }, 1000);
            }
        });

        // Handle retry offer after accept
        socketConnection.current.on('retry-offer-after-accept', (data: any) => {
            console.log('📹 Retry offer after accept signal received:', data);
            if (isAdmin && isInitialized.current) {
                console.log('🎯 Admin retrying offer after receiver accepted');
                setTimeout(() => {
                    // Retry sending the offer
                    if (peerConnectionRef.current && peerConnectionRef.current.localDescription) {
                        const offer = peerConnectionRef.current.localDescription;
                        console.log('🔍 DEBUG: Retrying offer after accept to room:', {
                            roomId: roomId,
                            offerType: offer.type,
                            socketId: socketConnection.current?.id
                        });
                        socketConnection.current?.emit('offer', offer, roomId);
                    }
                }, 2000); // Wait 2 seconds for receiver to be ready
            }
        });
        
        socketConnection.current.on('user-disconnected', () => {
            console.log('User disconnected event received');
            handleUserDisconnected();
        });
        
        // Pulse system event listeners
        socketConnection.current.on('video-call-pulse', (pulseData: any) => {
            handlePulseReceived(pulseData);
        });
        
        socketConnection.current.on('video-call-pulse-timeout', (data: any) => {
            console.log('💓 Pulse timeout notification received:', data);
            if (data.roomId === roomId) {
                console.log('💓 Other user timed out, triggering reconnection...');
                triggerReconnection();
            }
        });
        
        // Handle room join confirmation
        socketConnection.current.on('room-joined', (data: any) => {
            console.log('✅ Room joined successfully:', data);
            roomJoinedRef.current = true;
            
            // Start peer connection after room is confirmed joined
            // Only start if we haven't started it yet
            if (!peerConnectionStarted.current) {
                const startDelay = isAdmin ? 1000 : 2000; // Admin starts first, user waits longer
                setTimeout(() => {
                    console.log(`${isAdmin ? 'Admin' : 'User'} starting peer connection after room join confirmation...`);
                    startPeerConnection();
                }, startDelay);
            }
        });
        
        // Listen for other users joining the room
        socketConnection.current.on('user-joined-room', (data: any) => {
            console.log('👤 Another user joined the room:', data);
        });
    };

    const setupSocketConnection = (): void => {
        if (!socketConnection.current) return;
        
        console.log(`Socket connected with ID: ${socketConnection.current.id}`);
        console.log(`User type: ${isAdmin ? 'Admin' : 'User'}`);
        
        setupWebRTCEventListeners();
        
        if (currentUser) {
            const authData: AuthData = {
                userId: currentUser._id,
                email: currentUser.email,
                role: currentUser.role,
                company: currentUser.company,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName
            };
            console.log('Authenticating user:', authData.email);
            socketConnection.current.emit('user-authenticated', authData);
        } else {
            console.log('No current user data available');
        }
        
        if (isAdmin && currentUser?.email) {
            console.log('🔍 DEBUG: Admin joining room:', {
                adminEmail: currentUser.email,
                roomId: roomId,
                socketId: socketConnection.current?.id
            });
            socketConnection.current.emit('join-room', roomId, { adminEmail: currentUser.email });
        } else {
            console.log('🔍 DEBUG: User joining room:', {
                roomId: roomId,
                socketId: socketConnection.current?.id
            });
            socketConnection.current.emit('join-room', roomId);
        }
    };

    useEffect(() => {
        // Reset initialization flag when isAdmin or roomId changes
        isInitialized.current = false;
        answerProcessed.current = false;
        processedMessages.current.clear();
        roomJoinedRef.current = false;
        
        console.log('🎯 WebRTC hook initializing...', { 
            isAdmin, 
            roomId, 
            userType: isAdmin ? 'ADMIN' : 'USER',
            urlParams: typeof window !== 'undefined' ? window.location.search : 'N/A'
        });
        
        // Add a small delay to prevent race conditions between caller and receiver
        const initDelay = isAdmin ? 0 : 1000; // Receiver waits 1 second to let caller initialize first
        
        setTimeout(() => {
            isInitialized.current = true;
            
            // Use the global socket service
            const socket = socketService.getSocket();
            if (socket && socket.connected) {
                console.log('Using global socket for WebRTC:', socket.id);
                socketConnection.current = socket;
                setupSocketConnection();
            } else {
                console.log('Global socket not ready, waiting...');
                // Ensure socket is connected
                if (!socketService.getConnected()) {
                    console.log('Socket not connected, connecting...');
                    socketService.connect();
                }
                // Wait for socket to be ready with a timeout
                let attempts = 0;
                const maxAttempts = 10; // 10 seconds max wait
                const checkSocket = () => {
                    attempts++;
                    const currentSocket = socketService.getSocket();
                    if (currentSocket && currentSocket.connected) {
                        console.log('Global socket ready, setting up WebRTC');
                        socketConnection.current = currentSocket;
                        setupSocketConnection();
                    } else if (attempts < maxAttempts) {
                        setTimeout(checkSocket, 1000);
                    } else {
                        console.error('Failed to connect to socket after maximum attempts');
                    }
                };
                checkSocket();
            }
        }, initDelay);

        // Listen for reconnection events
        const handleReconnectionEvent = (event: CustomEvent) => {
            console.log('🔄 Reconnection event received:', event.detail);
            triggerReconnection();
        };

        window.addEventListener('connection-reconnect', handleReconnectionEvent as EventListener);

        return () => {
            window.removeEventListener('connection-reconnect', handleReconnectionEvent as EventListener);
            
            // Stop pulse system
            stopPulseSystem();
            
            // Stop connection monitoring
            if (connectionMonitorRef.current) {
                connectionMonitorRef.current.stopMonitoring();
                connectionMonitorRef.current = null;
            }
            
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (remoteStream) {
                remoteStream.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
    }, [isAdmin, roomId]); // Re-initialize when isAdmin or roomId changes

    const getUserMedia = async (): Promise<MediaStream> => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
            }

            try {
                const cameraPermission = await navigator.permissions.query({ name: 'camera' });
                const microphonePermission = await navigator.permissions.query({ name: 'microphone' });
                
                if (cameraPermission.state === 'denied' || microphonePermission.state === 'denied') {
                    throw new Error('Camera or microphone permission denied. Please enable access in browser settings and refresh the page.');
                }
            } catch (permError) {
                // Permission API not supported, proceeding...
            }

            let availableDevices: MediaDeviceInfo[] = [];
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const cameras = devices.filter(device => device.kind === 'videoinput');
                const microphones = devices.filter(device => device.kind === 'audioinput');
                
                if (cameras.length === 0) {
                    throw new Error('No camera devices found. Please connect a camera and refresh the page.');
                }
                if (microphones.length === 0) {
                    throw new Error('No microphone devices found. Please connect a microphone and refresh the page.');
                }
            } catch (enumError) {
                // Could not enumerate devices, proceeding with basic constraints
            }
            interface ConstraintStrategy {
                name: string;
                constraints: MediaStreamConstraints;
            }

            const constraintStrategies: ConstraintStrategy[] = isMobile ? [
                {
                    name: "Ultra High Quality 4K Back Camera",
                    constraints: {
                        video: {
                            facingMode: { ideal: "environment" },
                            width: { min: 1920, ideal: 3840, max: 7680 },
                            height: { min: 1080, ideal: 2160, max: 4320 },
                            frameRate: { min: 24, ideal: 60, max: 120 },
                            aspectRatio: { ideal: 16 / 9 }
                        },
                        audio: true
                    }
                },
                {
                    name: "High Quality 2K Back Camera",
                    constraints: {
                        video: {
                            facingMode: { ideal: "environment" },
                            width: { min: 1280, ideal: 2560, max: 3840 },
                            height: { min: 720, ideal: 1440, max: 2160 },
                            frameRate: { min: 24, ideal: 60, max: 120 },
                            aspectRatio: { ideal: 16 / 9 }
                        },
                        audio: true
                    }
                },
                {
                    name: "Premium Full HD Back Camera",
                    constraints: {
                        video: {
                            facingMode: { ideal: "environment" },
                            width: { min: 1280, ideal: 1920, max: 2560 },
                            height: { min: 720, ideal: 1080, max: 1440 },
                            frameRate: { min: 30, ideal: 60, max: 120 },
                            aspectRatio: { ideal: 16 / 9 }
                        },
                        audio: true
                    }
                },
                {
                    name: "Basic Back Camera",
                    constraints: {
                        video: {
                            facingMode: "environment"
                        },
                        audio: true
                    }
                },
                {
                    name: "Ultra High Quality Any Camera",
                    constraints: {
                        video: {
                            width: { min: 1920, ideal: 3840, max: 7680 },
                            height: { min: 1080, ideal: 2160, max: 4320 },
                            frameRate: { min: 24, ideal: 60, max: 120 },
                            aspectRatio: { ideal: 16 / 9 }
                        },
                        audio: true
                    }
                },
                {
                    name: "High Quality Any Camera",
                    constraints: {
                        video: {
                            width: { min: 1280, ideal: 1920, max: 3840 },
                            height: { min: 720, ideal: 1080, max: 2160 },
                            frameRate: { min: 30, ideal: 60, max: 120 },
                            aspectRatio: { ideal: 16 / 9 }
                        },
                        audio: true
                    }
                },
                {
                    name: "Basic Quality Any Camera",
                    constraints: {
                        video: {
                            width: { ideal: 1280 },
                            height: { ideal: 720 }
                        },
                        audio: true
                    }
                },
                {
                    name: "Very Basic Video Only",
                    constraints: {
                        video: true,
                        audio: true
                    }
                },
                {
                    name: "Front Camera Fallback",
                    constraints: {
                        video: {
                            facingMode: "user"
                        },
                        audio: true
                    }
                }
            ] : [
                {
                    name: "Ultra High Quality 4K Back Camera",
                    constraints: {
                        video: {
                            facingMode: { ideal: "environment" },
                            width: { min: 1080, ideal: 2160, max: 4320 },
                            height: { min: 1920, ideal: 3840, max: 7680 },
                            frameRate: { min: 24, ideal: 60, max: 120 },
                            aspectRatio: { ideal: 9 / 16 }
                        },
                        audio: true
                    }
                },
                {
                    name: "High Quality 2K Back Camera",
                    constraints: {
                        video: {
                            facingMode: { ideal: "environment" },
                            width: { min: 720, ideal: 1440, max: 2160 },
                            height: { min: 1280, ideal: 2560, max: 3840 },
                            frameRate: { min: 24, ideal: 60, max: 120 },
                            aspectRatio: { ideal: 9 / 16 }
                        },
                        audio: true
                    }
                },
                {
                    name: "Premium Full HD Back Camera",
                    constraints: {
                        video: {
                            facingMode: { ideal: "environment" },
                            width: { min: 720, ideal: 1080, max: 1440 },
                            height: { min: 1280, ideal: 1920, max: 2560 },
                            frameRate: { min: 30, ideal: 60, max: 120 },
                            aspectRatio: { ideal: 9 / 16 }
                        },
                        audio: true
                    }
                },
                {
                    name: "Basic Back Camera",
                    constraints: {
                        video: {
                            facingMode: "environment"
                        },
                        audio: true
                    }
                },
                {
                    name: "Ultra High Quality Any Camera",
                    constraints: {
                        video: {
                            width: { min: 1080, ideal: 2160, max: 4320 },
                            height: { min: 1920, ideal: 3840, max: 7680 },
                            frameRate: { min: 24, ideal: 60, max: 120 },
                            aspectRatio: { ideal: 9 / 16 }
                        },
                        audio: true
                    }
                },
                {
                    name: "High Quality Any Camera",
                    constraints: {
                        video: {
                            width: { min: 1280, ideal: 1920, max: 3840 },
                            height: { min: 720, ideal: 1080, max: 2160 },
                            frameRate: { min: 30, ideal: 60, max: 120 },
                            aspectRatio: { ideal: 9 / 16 }
                        },
                        audio: true
                    }
                },
                {
                    name: "Basic Quality Any Camera",
                    constraints: {
                        video: {
                            width: { ideal: 1280 },
                            height: { ideal: 720 }
                        },
                        audio: true
                    }
                },
                {
                    name: "Very Basic Video Only",
                    constraints: {
                        video: true,
                        audio: true
                    }
                },
                {
                    name: "Front Camera Fallback",
                    constraints: {
                        video: {
                            facingMode: "user"
                        },
                        audio: true
                    }
                }
            ];

            let stream: MediaStream | null = null;
            let usedStrategy: string | null = null;
            let lastError: Error | null = null;

            for (const strategy of constraintStrategies) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia(strategy.constraints);
                    usedStrategy = strategy.name;
                    break;
                } catch (strategyError) {
                    lastError = strategyError as Error;

                    if ((strategyError as Error).name === 'OverconstrainedError' ||
                        (strategyError as Error).message.includes('Requested device not found') ||
                        (strategyError as Error).message.includes('facingMode') ||
                        (strategyError as Error).message.includes('constraint')) {

                        try {
                            const fallbackConstraints = { ...strategy.constraints };

                            if (fallbackConstraints.video && typeof fallbackConstraints.video === 'object') {
                                delete (fallbackConstraints.video as any).facingMode;
                                delete (fallbackConstraints.video as any).width;
                                delete (fallbackConstraints.video as any).height;
                                delete (fallbackConstraints.video as any).frameRate;

                                stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
                                usedStrategy = strategy.name + " (relaxed constraints)";
                                break;
                            }
                        } catch (fallbackError) {
                            // Fallback also failed
                        }
                    }
                    continue;
                }
            }

            if (!stream) {
                let userMessage = 'Unable to access camera and microphone. ';

                if (lastError) {
                    if (lastError.name === 'NotFoundError' || lastError.message.includes('Requested device not found')) {
                        userMessage += 'No camera or microphone found. Please ensure both are connected and not being used by another application.';
                    } else if (lastError.name === 'NotAllowedError' || lastError.message.includes('Permission denied')) {
                        userMessage += 'Camera and microphone permission denied. Please allow access when prompted or enable it in browser settings.';
                    } else if (lastError.name === 'NotReadableError') {
                        userMessage += 'Camera and microphone are busy or being used by another application. Please close other apps and try again.';
                    } else if (lastError.name === 'SecurityError') {
                        userMessage += 'Camera and microphone access blocked. Please use HTTPS or localhost.';
                    } else {
                        userMessage += 'Please check camera and microphone permissions and device availability.';
                    }
                } else {
                    userMessage += 'Please check camera permissions and device availability.';
                }

                const error = new Error(userMessage);
                (error as any).originalError = lastError;
                throw error;
            }

            const videoTrack = stream.getVideoTracks()[0];

            if (videoTrack) {
                const settings = videoTrack.getSettings();
                try {
                    const capabilities = videoTrack.getCapabilities();
                } catch (capError) {
                    // Could not get video capabilities
                }
            }

            setLocalStream(stream);
            localStreamRef.current = stream;

            // Don't set local stream to main videoRef - only remote video should show there
            // Local video will be handled by the Picture-in-Picture component in the UI

            return stream;

        } catch (error) {
            throw error;
        }
    };

    const createRTCPeerConnection = (): RTCPeerConnection => {
        if (peerConnectionRef.current) {
            try {
                peerConnectionRef.current.close();
            } catch (error) {
                // Error closing peer connection
            }
        }
        
        // Reset answer processing flag and processed messages for new connection
        answerProcessed.current = false;
        processedMessages.current.clear();
        
        const peerConnection = new RTCPeerConnection(peerConfig);
        
        // Initialize connection monitor
        if (!connectionMonitorRef.current) {
            connectionMonitorRef.current = new ConnectionMonitor({
                maxRetries: maxReconnectionAttempts,
                baseDelay: 2000, // 2 seconds
                maxDelay: 30000, // 30 seconds
                onConnectionLost: () => {
                    console.log('🔍 Connection lost detected by monitor');
                    setIsConnected(false);
                    setConnectionState('failed');
                },
                onReconnecting: (attempt) => {
                    console.log(`🔄 Reconnection attempt ${attempt} started`);
                    setIsReconnecting(true);
                    setReconnectionAttempt(attempt);
                    setConnectionState('connecting');
                },
                onReconnected: () => {
                    console.log('✅ Reconnection successful');
                    setIsReconnecting(false);
                    setReconnectionAttempt(0);
                    setIsConnected(true);
                    setConnectionState('connected');
                },
                onReconnectionFailed: () => {
                    console.log('❌ All reconnection attempts failed');
                    setIsReconnecting(false);
                    setConnectionState('failed');
                    // Optionally redirect after all attempts failed
                    setTimeout(() => {
                        handleDisconnect(true);
                    }, 5000);
                }
            });
            
            // Set up reconnection callback
            connectionMonitorRef.current.setConnectionLostCallback(() => {
                console.log('🔄 Connection lost, triggering reconnection...');
                triggerReconnection();
            });
        }
        
        // Start monitoring this connection
        connectionMonitorRef.current.startMonitoring(peerConnection);
        
        // Reset answer processing flag when connection state changes
        peerConnection.onconnectionstatechange = () => {
            const state = peerConnection.connectionState;
            console.log('🔍 Peer connection state changed:', state);
            
            if (state === 'connected') {
                setIsConnected(true);
                setConnectionState('connected');
                console.log('✅ WebRTC connection established successfully');
                
                // Start pulse system when connected
                startPulseSystem();
            } else if (state === 'failed' || state === 'disconnected') {
                setIsConnected(false);
                setConnectionState('failed');
                console.log('❌ WebRTC connection failed or disconnected');
                
                // Stop pulse system when disconnected
                stopPulseSystem();
                
                // Reset answer processing flag on failure
                answerProcessed.current = false;
            } else if (state === 'connecting') {
                setConnectionState('connecting');
                console.log('🔄 WebRTC connection in progress...');
            }
        };

        peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                console.log('🔍 DEBUG: Sending ICE candidate to room:', {
                    roomId: roomId,
                    candidateType: event.candidate.candidate,
                    socketId: socketConnection.current?.id
                });
                socketConnection.current?.emit('ice-candidate', event.candidate, roomId);
            } else {
                console.log('ICE gathering complete');
            }
        }

        // Both admin and user should add their local streams
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStreamRef.current!);
            });
        }

        peerConnection.ontrack = (event: RTCTrackEvent) => {
            console.log('ontrack event received:', { isAdmin, streams: event.streams.length });
            
            // Both admin and user should receive and display remote video
                setRemoteStream(event.streams[0]);
                setTimeout(() => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = event.streams[0];
                        videoRef.current.play().then(() => {
                            setIsConnected(true);
                        console.log(`${isAdmin ? 'Admin' : 'User'} video stream set successfully`);
                        }).catch((error) => {
                            setIsConnected(true);
                            if (error.name === 'NotAllowedError') {
                                console.log('Video autoplay blocked by browser - user interaction required');
                                setShowVideoPlayError(true);
                            } else if (error.name === 'AbortError') {
                                console.log('Video play interrupted - this is normal during reconnections');
                                // Don't show error for AbortError
                            } else {
                                console.error(`${isAdmin ? 'Admin' : 'User'} video play error:`, error);
                                setShowVideoPlayError(true);
                            }
                        });
                    }
            }, 1000);
        }

        peerConnection.onicecandidateerror = (error: Event) => {
            // ICE candidate errors are often normal during connection establishment
        }

        peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state changed:', peerConnection.iceConnectionState);
            if (peerConnection.iceConnectionState === "disconnected") {
                console.log('ICE connection disconnected');
                setIsConnected(false);
                if (!isAdmin) {
                    router.push('/');
                }
            } else if (peerConnection.iceConnectionState === "connected") {
                console.log('ICE connection established');
            }
        }

        peerConnection.onicegatheringstatechange = () => {
            // ICE gathering state changed
        }

        return peerConnection;
    }

    const handleVideoPlay = (): void => {
        if (videoRef.current) {
        videoRef.current.play();
        setIsConnected(true);
        setShowVideoPlayError(false);
        }
    }

    const startPeerConnection = async (): Promise<void> => {
        // Prevent multiple starts
        if (peerConnectionStarted.current) {
            console.log('⚠️ Peer connection already started, skipping...');
            return;
        }
        
        try {
            peerConnectionStarted.current = true;
            console.log('🎯 Starting peer connection:', { 
                isAdmin, 
                roomId, 
                userType: isAdmin ? 'ADMIN' : 'USER'
            });

            // Get user media first
            console.log(`Getting user media for ${isAdmin ? 'admin' : 'user'}...`);
            await getUserMedia();
            console.log(`${isAdmin ? 'Admin' : 'User'} media obtained successfully`);
            
            console.log('Creating peer connection...');
            const peerConnection = createRTCPeerConnection();
            peerConnectionRef.current = peerConnection;
            
            if (isAdmin) {
                // Admin creates and sends offer
                // Wait for room join confirmation before sending offer
                if (!roomJoinedRef.current) {
                    console.log('⏳ Waiting for room join confirmation before sending offer...');
                    // Wait up to 5 seconds for room join confirmation
                    let waitCount = 0;
                    const maxWait = 50; // 5 seconds (50 * 100ms)
                    while (!roomJoinedRef.current && waitCount < maxWait) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        waitCount++;
                    }
                    if (!roomJoinedRef.current) {
                        console.warn('⚠️ Room join confirmation not received, proceeding anyway...');
                    }
                }
                
                console.log('Creating offer...');
                const offer = await peerConnection.createOffer();
                
                console.log('Setting local description...');
                await peerConnection.setLocalDescription(offer);
                
                console.log('🔍 DEBUG: Sending offer to room:', {
                    roomId: roomId,
                    offerType: offer.type,
                    socketId: socketConnection.current?.id,
                    offerSdpPreview: offer.sdp?.substring(0, 50) + '...',
                    roomJoined: roomJoinedRef.current
                });
                socketConnection.current?.emit('offer', offer, roomId);
                console.log('🔍 DEBUG: Offer sent successfully');
                console.log('Admin peer connection started successfully');
            } else {
                // User waits for offer from admin
                console.log('User waiting for offer from admin...');
                
                // Request offer retry after a delay if no offer received
                setTimeout(() => {
                    if (!peerConnectionRef.current?.remoteDescription) {
                        console.log('🎯 No offer received, requesting retry...');
                        socketConnection.current?.emit('request-offer-retry', {
                            roomId: roomId,
                            userId: 'user'
                        });
                    }
                }, 5000); // Wait 5 seconds before requesting retry
            }
        } catch (error) {
            console.error('Error starting peer connection:', error);
            peerConnectionStarted.current = false; // Reset flag on error so we can retry
        }
    }

    const handleOffer = async (offer: RTCSessionDescriptionInit): Promise<void> => {
        try {
            console.log('🔍 DEBUG: Handling offer:', {
                isAdmin,
                offerType: offer.type,
                roomId: roomId,
                peerConnectionState: peerConnectionRef.current?.connectionState,
                signalingState: peerConnectionRef.current?.signalingState
            });
            
            // Get user media before creating peer connection
            if (!localStreamRef.current) {
                console.log('Getting user media for offer handling...');
                await getUserMedia();
            }
            
            // Create new peer connection if none exists
            if (!peerConnectionRef.current) {
                console.log('Creating new peer connection for offer handling');
                const peerConnection = createRTCPeerConnection();
                peerConnectionRef.current = peerConnection;
            }
            
            // Check if we're in the right state to handle offer
            const currentState = peerConnectionRef.current.signalingState;
            console.log('🔍 DEBUG: Current signaling state:', currentState);
            
            if (currentState === 'stable') {
                try {
                    // Initial state - we can handle the offer
                    console.log('Setting remote description');
                    await peerConnectionRef.current.setRemoteDescription(offer);
                    
                    console.log('Creating answer');
                    const answer = await peerConnectionRef.current.createAnswer();
                    
                    console.log('Setting local description');
                    await peerConnectionRef.current.setLocalDescription(answer);
                    
                    console.log('🔍 DEBUG: Sending answer to room:', {
                        roomId: roomId,
                        answerType: answer.type,
                        socketId: socketConnection.current?.id
                    });
                    socketConnection.current?.emit('answer', answer, roomId);
                } catch (setDescError) {
                    console.error('Error setting remote description for offer:', setDescError);
                    // If setting remote description fails, we might need to recreate the connection
                    if ((setDescError as Error).name === 'InvalidStateError') {
                        console.log('Invalid state error - recreating peer connection');
                        peerConnectionRef.current.close();
                        peerConnectionRef.current = null;
                        const newPeerConnection = createRTCPeerConnection();
                        peerConnectionRef.current = newPeerConnection;
                        
                        // Retry setting the offer
                        try {
                            await peerConnectionRef.current.setRemoteDescription(offer);
                            const answer = await peerConnectionRef.current.createAnswer();
                            await peerConnectionRef.current.setLocalDescription(answer);
                            socketConnection.current?.emit('answer', answer, roomId);
                        } catch (retryError) {
                            console.error('Error retrying offer handling:', retryError);
                        }
                    }
                }
            } else if (currentState === 'have-local-offer') {
                console.log('Cannot handle offer - already have local offer');
                return;
            } else if (currentState === 'have-remote-offer') {
                console.log('Cannot handle offer - already have remote offer');
                return;
            } else if (currentState === 'closed') {
                console.log('Cannot handle offer - peer connection is closed');
                return;
            } else {
                console.warn('Cannot handle offer in current state:', currentState);
                return;
            }
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }

    const handleAnswer = async (answer: RTCSessionDescriptionInit): Promise<void> => {
        try {
            console.log('🔍 DEBUG: Handling answer:', {
                isAdmin,
                answerType: answer.type,
                roomId: roomId,
                peerConnectionState: peerConnectionRef.current?.connectionState,
                signalingState: peerConnectionRef.current?.signalingState,
                answerProcessed: answerProcessed.current,
                answerSdpPreview: answer.sdp?.substring(0, 50) + '...'
            });
            
            // Prevent duplicate answer processing
            if (answerProcessed.current) {
                console.log('Answer already processed, skipping...');
                return;
            }
            
            if (!peerConnectionRef.current) {
                console.error('No peer connection available for answer');
                return;
            }
            
            const currentState = peerConnectionRef.current.signalingState;
            console.log('🔍 DEBUG: Current signaling state for answer:', currentState);
            
            // Only process answer if we're in the right state
            if (currentState === 'have-local-offer') {
                try {
                    console.log('Setting remote description for answer');
                    await peerConnectionRef.current.setRemoteDescription(answer);
                    answerProcessed.current = true;
                    console.log('Answer processed successfully');
                } catch (setDescError) {
                    console.error('Error setting remote description for answer:', setDescError);
                    // If setting remote description fails, mark as processed to prevent retries
                    answerProcessed.current = true;
                }
            } else if (currentState === 'stable') {
                console.log('Answer received in stable state - connection may already be established, skipping');
                answerProcessed.current = true;
                return;
            } else if (currentState === 'have-remote-offer') {
                console.log('Cannot handle answer - we are in have-remote-offer state (should be handling offer, not answer)');
                return;
            } else if (currentState === 'closed') {
                console.log('Cannot handle answer - peer connection is closed');
                return;
            } else {
                console.warn('Cannot handle answer in current state:', currentState);
                return;
            }
        } catch (error) {
            console.error('Error handling answer:', error);
            // Mark as processed to prevent infinite retries
            answerProcessed.current = true;
        }
    }

    const handleIceCandidate = async (candidate: RTCIceCandidateInit): Promise<void> => {
        try {
            console.log('🔍 DEBUG: Adding ICE candidate:', {
                isAdmin,
                candidateType: candidate.candidate,
                roomId: roomId,
                peerConnectionState: peerConnectionRef.current?.connectionState,
                signalingState: peerConnectionRef.current?.signalingState
            });
            
            if (peerConnectionRef.current) {
                const currentState = peerConnectionRef.current.signalingState;
                console.log('🔍 DEBUG: Current signaling state for ICE candidate:', currentState);
                
                if (currentState !== 'closed') {
                    await peerConnectionRef.current.addIceCandidate(candidate);
                    console.log('ICE candidate added successfully');
                } else {
                    console.warn('Cannot add ICE candidate - peer connection is closed');
                }
            } else {
                console.error('No peer connection available for ICE candidate');
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    }

    /**
     * Trigger reconnection by recreating the peer connection
     */
    const triggerReconnection = async (): Promise<void> => {
        try {
            console.log('🔄 Triggering reconnection...');
            
            // Stop pulse system during reconnection
            stopPulseSystem();
            
            // Clean up existing connection
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
            
            // Reset flags
            answerProcessed.current = false;
            processedMessages.current.clear();
            peerConnectionStarted.current = false;
            
            // Wait a moment before reconnecting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Restart peer connection
            await startPeerConnection();
            
        } catch (error) {
            console.error('Error during reconnection:', error);
        }
    };

    const handleDisconnect = (shouldRedirect: boolean = true): void => {
        try {
            // Stop pulse system
            stopPulseSystem();
            
            // Stop connection monitoring
            if (connectionMonitorRef.current) {
                connectionMonitorRef.current.stopMonitoring();
                connectionMonitorRef.current = null;
            }
            
            socketConnection.current?.emit('user-disconnected', roomId);
            setIsConnected(false);
            setIsReconnecting(false);
            setReconnectionAttempt(0);
            
            // Reset flags
            answerProcessed.current = false;
            processedMessages.current.clear();
            
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
            
            localStream?.getTracks().forEach(track => track.stop());
            if (remoteStream) {
                remoteStream.getTracks().forEach(track => track.stop());
            }

            if (shouldRedirect) {
                if (!isAdmin) {
                    router.push('/?show-feedback=true');
                }
                else {
                    router.push(`../../../dashboard/`);
                }
            }
        } catch (error) {
            console.error('Error disconnecting:', error);
        }
    }

    const handleUserDisconnected = (): void => {
        console.log('🔍 DEBUG: User disconnected, redirecting both users...', { isAdmin });
        setIsConnected(false);
        setShowVideoPlayError(false);

        // Both admin and user should be redirected when call ends
        if (!isAdmin) {
            // Regular user goes to feedback page
            const redirectUrl = localStorage.getItem("redirectUrl");
            if (redirectUrl) {
                const feedbackUrl = `/?show-feedback=true&redirectUrl=${encodeURIComponent(redirectUrl)}`;
                window.location.href = feedbackUrl;
            } else {
                router.push('/?show-feedback=true');
            }
        } else {
            // Admin goes back to dashboard
            router.push('/dashboard/');
        }
    }

    useEffect(() => {
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (remoteStream) {
                remoteStream.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            // Don't disconnect global socket - it's managed by socketService
        };
    }, []);

    return {
        localStream,
        remoteStream,
        socket,
        socketConnection,
        handleDisconnect,
        startPeerConnection,
        isConnected,
        connectionState,
        handleVideoPlay,
        showVideoPlayError,
        isReconnecting,
        reconnectionAttempt,
        maxReconnectionAttempts
    }
}

export default useWebRTC;