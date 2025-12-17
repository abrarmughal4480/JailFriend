import { useEffect, useRef, useState, useCallback } from 'react';
import { WavStreamPlayer } from 'wavtools';
import { Socket } from 'socket.io-client';

interface TranslationConfig {
    roomId: string;
    targetLanguage: string;
    sourceLanguage?: string;
    translationType?: 'one_way' | 'two_way';
    ttsVoice?: string;
}

interface TranslationResult {
    transcript: string;
    translation: string | null;
    isFinal: boolean;
    speaker?: string;
    language?: string;
}

interface UseRealtimeTranslationProps {
    socket: Socket | null;
    enabled: boolean;
    config: TranslationConfig;
    onTranscript?: (result: TranslationResult) => void;
    onError?: (error: { status?: string; message: string }) => void;
    inputStream?: MediaStream | null; // Optional: stream to translate (e.g., remote stream)
}

export const useRealtimeTranslation = ({
    socket,
    enabled,
    config,
    onTranscript,
    onError,
    inputStream
}: UseRealtimeTranslationProps) => {
    const [isTranslating, setIsTranslating] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [currentTranslation, setCurrentTranslation] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const wavPlayerRef = useRef<WavStreamPlayer | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize WavStreamPlayer for playing translated audio
    const initWavPlayer = useCallback(async () => {
        if (wavPlayerRef.current) return wavPlayerRef.current;

        try {
            console.log('🎙️ Initializing WavStreamPlayer...');
            const wavPlayer = new WavStreamPlayer({ sampleRate: 24000 });
            await wavPlayer.connect();
            wavPlayerRef.current = wavPlayer;
            console.log('✅ WavStreamPlayer initialized and connected');
            return wavPlayer;
        } catch (error) {
            console.error('❌ Error initializing WavStreamPlayer:', error);
            return null;
        }
    }, []);

    useEffect(() => {
        initWavPlayer();

        return () => {
            if (wavPlayerRef.current) {
                // Cleanup WavStreamPlayer
                try {
                    wavPlayerRef.current.interrupt();
                } catch (e) {
                    console.error('Error interrupting WavStreamPlayer:', e);
                }
            }
        };
    }, [initWavPlayer]);

    // Start translation
    const startTranslation = useCallback(async () => {
        console.log('🔍 DEBUG: startTranslation called', {
            hasSocket: !!socket,
            socketConnected: socket?.connected,
            enabled,
            isTranslating,
            config
        });

        if (!socket) {
            console.error('❌ No socket available');
            return;
        }

        if (!socket.connected) {
            console.error('❌ Socket not connected');
            return;
        }

        if (!enabled) {
            console.warn('⚠️ Translation not enabled');
            return;
        }

        if (isTranslating) {
            console.warn('⚠️ Translation already active');
            return;
        }

        try {
            // Try to resume AudioContext if it's suspended
            if (wavPlayerRef.current) {
                const context = (wavPlayerRef.current as any).context;
                if (context && context.state === 'suspended') {
                    await context.resume();
                    console.log('🔊 AudioContext resumed');
                }
            }

            let stream = inputStream;

            if (!stream) {
                console.log('🎙️ No input stream provided, requesting microphone access...');
                // Get user media (audio only)
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        sampleRate: 16000,
                        channelCount: 1
                    }
                });
                console.log('✅ Got user microphone stream');
            } else {
                console.log('✅ Using provided input stream for translation');
            }

            audioStreamRef.current = stream;

            // FIRST: Enable translation on backend and wait for confirmation
            console.log('📤 Emitting enable-translation event', {
                roomId: config.roomId,
                targetLanguage: config.targetLanguage,
                sourceLanguage: config.sourceLanguage,
                translationType: config.translationType || 'one_way'
            });

            // Create a promise that resolves when backend confirms translation is ready
            const translationReadyPromise = new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Translation initialization timeout'));
                }, 5000); // 5 second timeout

                const handleEnabled = () => {
                    clearTimeout(timeout);
                    socket.off('translation-enabled', handleEnabled);
                    socket.off('translation-error', (err: any) => console.error(err));
                    console.log('✅ Backend confirmed translation is ready');
                    resolve();
                };

                const handleError = (error: any) => {
                    clearTimeout(timeout);
                    socket.off('translation-enabled', handleEnabled);
                    socket.off('translation-error', handleError);
                    console.error('❌ Backend translation error:', error);
                    reject(new Error(error.message || 'Translation initialization failed'));
                };

                socket.once('translation-enabled', handleEnabled);
                socket.once('translation-error', handleError);
            });

            socket.emit('enable-translation', {
                roomId: config.roomId,
                callId: config.roomId, // Add callId for authorization
                targetLanguage: config.targetLanguage,
                sourceLanguage: config.sourceLanguage,
                translationType: config.translationType || 'one_way',
                ttsVoice: config.ttsVoice,
                isTranslatingRemote: !!inputStream // Flag to tell server who gets the audio
            });

            // Wait for backend to confirm translation is ready
            await translationReadyPromise;
            console.log('🎙️ Backend is ready, starting audio capture...');

            // Create AudioContext for processing audio
            const audioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);

            // Create ScriptProcessor for capturing audio data
            // Note: ScriptProcessor is deprecated but still widely supported
            // For production, consider using AudioWorklet
            const bufferSize = 4096;
            const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);

            processor.onaudioprocess = (e) => {
                if (!socket || !socket.connected) return;

                const inputData = e.inputBuffer.getChannelData(0);

                // Convert Float32 to Int16 (PCM16)
                const pcm16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    // Clamp values to [-1, 1] and convert to 16-bit integer
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Send PCM16 data to backend as binary
                // Use the buffer directly instead of converting to array
                socket.emit('translation-audio-chunk', {
                    audioChunk: pcm16.buffer,
                    roomId: config.roomId
                });
            };

            // Connect the audio graph
            source.connect(processor);
            processor.connect(audioContext.destination);

            // Store processor reference for cleanup
            (mediaRecorderRef as any).current = { processor, source, audioContext };

            console.log('🎙️ Audio capture started with PCM16 format');

            setIsTranslating(true);
            console.log('✅ Translation started');
        } catch (error) {
            console.error('❌ Error starting translation:', error);
            if (onError) {
                onError({ message: 'Failed to start translation: ' + (error as Error).message });
            }
        }
    }, [socket, enabled, isTranslating, config, onError, inputStream]);

    // Stop translation
    const stopTranslation = useCallback(() => {
        if (!socket || !isTranslating) return;

        console.log('🛑 Stopping translation...');

        // Stop audio processor
        if (mediaRecorderRef.current) {
            const { processor, source, audioContext } = mediaRecorderRef.current as any;

            if (processor) {
                processor.disconnect();
                source.disconnect();
            }

            if (audioContext && audioContext.state !== 'closed') {
                audioContext.close();
            }

            mediaRecorderRef.current = null;
        }

        // Stop audio stream
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
            audioStreamRef.current = null;
        }

        // Finalize transcription
        socket.emit('translation-finalize');

        // Disable translation
        socket.emit('disable-translation', {
            roomId: config.roomId
        });

        setIsTranslating(false);
        setCurrentTranscript('');
        setCurrentTranslation('');
        console.log('✅ Translation stopped');
    }, [socket, isTranslating, config.roomId]);

    // Socket event handlers
    useEffect(() => {
        if (!socket) return;

        // Translation enabled
        const handleTranslationEnabled = (data: any) => {
            console.log('✅ Translation enabled:', data);
        };

        // Translation result
        const handleTranslationResult = (result: TranslationResult) => {
            console.log('📝 Translation result:', result);

            if (result.transcript) {
                setCurrentTranscript(result.transcript);
            }
            if (result.translation) {
                setCurrentTranslation(result.translation);
            }

            if (onTranscript) {
                onTranscript(result);
            }
        };

        // Translation audio (from other user)
        const handleTranslationAudio = async (data: {
            audio: any;
            text: string;
            fromUserId: string;
            fromUserName: string;
        }) => {
            console.log('🔊 Received translation audio from:', data.fromUserName);

            try {
                let audioBuffer: Int16Array;
                const audioData = data.audio;

                // Handle different audio data formats
                if (audioData instanceof ArrayBuffer) {
                    audioBuffer = new Int16Array(audioData);
                } else if (audioData instanceof Uint8Array || (audioData && audioData.buffer instanceof ArrayBuffer)) {
                    // Safe conversion from Uint8Array to Int16Array
                    const u8 = audioData instanceof Uint8Array ? audioData : new Uint8Array(audioData.buffer || audioData);
                    const ab = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
                    audioBuffer = new Int16Array(ab);
                } else if (Array.isArray(audioData)) {
                    audioBuffer = new Int16Array(audioData);
                } else if (audioData && audioData.type === 'Buffer' && Array.isArray(audioData.data)) {
                    // Handle Node.js Buffer serialized as JSON
                    audioBuffer = new Int16Array(audioData.data);
                } else {
                    console.error('❌ Unknown audio data format:', typeof audioData,
                        audioData?.constructor?.name);
                    return;
                }

                if (audioBuffer.length === 0) {
                    console.warn('⚠️ Received empty audio buffer');
                    return;
                }

                console.log(`🎵 Received audio: ${audioBuffer.length} samples (${(audioBuffer.length / 24000).toFixed(2)}s)`);

                // Ensure player is ready and AudioContext is running
                let player = wavPlayerRef.current;
                if (!player) {
                    player = await initWavPlayer();
                }

                if (player) {
                    const pc = player as any;
                    if (pc.context && pc.context.state === 'suspended') {
                        console.log('🔊 AudioContext is suspended, attempting to resume...');
                        await pc.context.resume();
                        console.log('🔊 AudioContext state after resume:', pc.context.state);
                    }

                    // Add to player - this should start playback automatically if context is running
                    player.add16BitPCM(audioBuffer, `translation-${Date.now()}`);
                    console.log('▶️ Played translated audio chunk');
                } else {
                    console.error('❌ Cannot play audio: WavStreamPlayer not initialized');
                }
            } catch (error) {
                console.error('❌ Error playing translation audio:', error);
            }
        };

        // Translation error
        const handleTranslationError = (error: { status?: string; message: string }) => {
            console.error('❌ Translation error:', error);
            if (onError) {
                onError(error);
            }
            setIsTranslating(false);
        };

        // Translation disabled
        const handleTranslationDisabled = () => {
            console.log('🛑 Translation disabled');
            setIsTranslating(false);
        };

        // User translation enabled (other user)
        const handleUserTranslationEnabled = (data: any) => {
            console.log('👤 User enabled translation:', data.userName);
        };

        // User translation disabled (other user)
        const handleUserTranslationDisabled = (data: any) => {
            console.log('👤 User disabled translation:', data.userName);
        };

        // Register event listeners
        socket.on('translation-enabled', handleTranslationEnabled);
        socket.on('translation-result', handleTranslationResult);
        socket.on('translation-audio', handleTranslationAudio);
        socket.on('translation-error', handleTranslationError);
        socket.on('translation-disabled', handleTranslationDisabled);
        socket.on('user-translation-enabled', handleUserTranslationEnabled);
        socket.on('user-translation-disabled', handleUserTranslationDisabled);

        // Cleanup
        return () => {
            socket.off('translation-enabled', handleTranslationEnabled);
            socket.off('translation-result', handleTranslationResult);
            socket.off('translation-audio', handleTranslationAudio);
            socket.off('translation-error', handleTranslationError);
            socket.off('translation-disabled', handleTranslationDisabled);
            socket.off('user-translation-enabled', handleUserTranslationEnabled);
            socket.off('user-translation-disabled', handleUserTranslationDisabled);
        };
    }, [socket, onTranscript, onError, initWavPlayer]);

    // Auto start/stop based on enabled prop
    useEffect(() => {
        if (enabled && !isTranslating) {
            startTranslation();
        } else if (!enabled && isTranslating) {
            stopTranslation();
        }
    }, [enabled, isTranslating, startTranslation, stopTranslation]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isTranslating) {
                stopTranslation();
            }
        };
    }, [isTranslating, stopTranslation]);

    return {
        isTranslating,
        currentTranscript,
        currentTranslation,
        startTranslation,
        stopTranslation
    };
};
