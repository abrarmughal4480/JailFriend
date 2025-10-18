import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import socketService from '@/services/socketService';

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
    handleVideoPlay: () => void;
    showVideoPlayError: boolean;
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
    const localStreamRef = useRef<MediaStream | null>(null);
    const [showVideoPlayError, setShowVideoPlayError] = useState<boolean>(false);
    const router = useRouter();
    const isMobile = isMobileDevice();
    const answerProcessed = useRef<boolean>(false);

    const peerConnectionStarted = useRef<boolean>(false);
    const isInitialized = useRef<boolean>(false);

    const setupWebRTCEventListeners = (): void => {
        if (!socketConnection.current) {
            console.log('No socket connection available for event listeners');
            return;
        }
        
        console.log('Setting up WebRTC event listeners');
        
        socketConnection.current.on('offer', (offer: RTCSessionDescriptionInit) => {
            console.log('🔍 DEBUG: Received offer:', { 
                isAdmin, 
                offerType: offer.type,
                roomId: roomId,
                socketId: socketConnection.current?.id
            });
            handleOffer(offer);
        });
        
        socketConnection.current.on('answer', (answer: RTCSessionDescriptionInit) => {
            console.log('🔍 DEBUG: Received answer:', { 
                isAdmin, 
                answerType: answer.type,
                roomId: roomId,
                socketId: socketConnection.current?.id
            });
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
        
        socketConnection.current.on('user-disconnected', () => {
            console.log('User disconnected event received');
            handleUserDisconnected();
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

        // Start peer connection for both admin and user
        setTimeout(() => {
            console.log(`${isAdmin ? 'Admin' : 'User'} starting peer connection...`);
            startPeerConnection();
        }, 1000);
    };

    useEffect(() => {
        // Reset initialization flag when isAdmin or roomId changes
        isInitialized.current = false;
        answerProcessed.current = false;
        
        console.log('🎯 WebRTC hook initializing...', { 
            isAdmin, 
            roomId, 
            userType: isAdmin ? 'ADMIN' : 'USER'
        });
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

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(playError => {
                    // Video autoplay failed (this is normal)
                });
            }

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
        
        // Reset answer processing flag for new connection
        answerProcessed.current = false;
        
        const peerConnection = new RTCPeerConnection(peerConfig);

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
        try {
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
                console.log('Creating offer...');
                const offer = await peerConnection.createOffer();
                
                console.log('Setting local description...');
                await peerConnection.setLocalDescription(offer);
                
            console.log('🔍 DEBUG: Sending offer to room:', {
                roomId: roomId,
                offerType: offer.type,
                socketId: socketConnection.current?.id
            });
            socketConnection.current?.emit('offer', offer, roomId);
                console.log('Admin peer connection started successfully');
            } else {
                // User waits for offer from admin
                console.log('User waiting for offer from admin...');
            }
        } catch (error) {
            console.error('Error starting peer connection:', error);
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
            
            if (currentState === 'stable' || currentState === 'have-local-offer') {
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
            } else {
                console.warn('Cannot handle offer in current state:', currentState);
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
                answerProcessed: answerProcessed.current
            });
            
            // Prevent duplicate answer processing
            if (answerProcessed.current) {
                console.log('Answer already processed, skipping...');
                return;
            }
            
            if (peerConnectionRef.current) {
                const currentState = peerConnectionRef.current.signalingState;
                console.log('🔍 DEBUG: Current signaling state for answer:', currentState);
                
                // Only process answer if we're in the right state
                if (currentState === 'have-local-offer') {
                    console.log('Setting remote description for answer');
                    await peerConnectionRef.current.setRemoteDescription(answer);
                    answerProcessed.current = true;
                    console.log('Answer processed successfully');
                } else if (currentState === 'stable') {
                    console.log('Answer already processed - connection is stable');
                    answerProcessed.current = true;
                } else {
                    console.warn('Cannot handle answer in current state:', currentState);
                }
            } else {
                console.error('No peer connection available for answer');
            }
        } catch (error) {
            console.error('Error handling answer:', error);
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

    const handleDisconnect = (shouldRedirect: boolean = true): void => {
        try {
            socketConnection.current?.emit('user-disconnected', roomId);
            setIsConnected(false);
            
            // Reset flags
            answerProcessed.current = false;
            
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
        handleVideoPlay,
        showVideoPlayError
    }
}

export default useWebRTC;