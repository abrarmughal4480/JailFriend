const WebSocket = require('ws');
const { CartesiaClient } = require('@cartesia/cartesia-js');
const WebsiteSettings = require('../models/websiteSettings');

class SonioxService {
    constructor() {
        this.connections = new Map(); // userId -> { ws, config }
        this.cartesiaClient = null; // Lazy initialize when needed
    }

    /**
     * Get or create Cartesia client
     */
    async getCartesiaClient() {
        if (!this.cartesiaClient) {
            let apiKey = process.env.CARTESIA_API_KEY;

            try {
                const settings = await WebsiteSettings.getSettings();
                if (settings.ai && settings.ai.cartesia && settings.ai.cartesia.key) {
                    apiKey = settings.ai.cartesia.key;
                }
            } catch (err) {
                console.error('Error fetching settings for Cartesia:', err);
            }

            console.log('🔑 Cartesia API Key check:', {
                exists: !!apiKey,
                length: apiKey?.length,
                firstChars: apiKey?.substring(0, 10) + '...'
            });

            if (!apiKey) {
                throw new Error('CARTESIA_API_KEY not configured in environment variables or settings');
            }

            try {
                // Use CartesiaClient, not Cartesia (which is just an object)
                this.cartesiaClient = new CartesiaClient({
                    apiKey: apiKey
                });
                console.log('✅ Cartesia client initialized successfully');
            } catch (error) {
                console.error('❌ Error initializing Cartesia client:', error);
                throw error;
            }
        }
        return this.cartesiaClient;
    }

    /**
     * Initialize Soniox connection for a user
     * @param {string} userId - User ID
     * @param {object} config - Translation configuration
     * @param {function} onTranscript - Callback for transcript results
     * @param {function} onError - Callback for errors
     */
    async initializeConnection(userId, config, onTranscript, onError) {
        try {
            let sonioxApiKey = process.env.SONIOX_API_KEY;

            try {
                const settings = await WebsiteSettings.getSettings();
                if (settings.ai && settings.ai.soniox && settings.ai.soniox.key) {
                    sonioxApiKey = settings.ai.soniox.key;
                }
            } catch (err) {
                console.error('Error fetching settings for Soniox:', err);
            }

            console.log(`🔑 Soniox API Key check:`, {
                exists: !!sonioxApiKey,
                length: sonioxApiKey?.length,
                firstChars: sonioxApiKey?.substring(0, 10) + '...'
            });

            if (!sonioxApiKey) {
                const errorMsg = 'SONIOX_API_KEY not configured in environment variables or settings';
                console.error(`❌ ${errorMsg}`);
                if (onError) {
                    onError('initialization_error', errorMsg);
                }
                return false;
            }

            // Close existing connection if any
            this.closeConnection(userId);

            console.log(`🎙️ Initializing Soniox WebSocket for user ${userId}...`);

            // Create WebSocket connection to Soniox
            // Using official Soniox real-time transcription endpoint
            const ws = new WebSocket('wss://stt-rt.soniox.com/transcribe-websocket');

            ws.onopen = () => {
                console.log(`🎙️ Soniox WebSocket opened for user ${userId}`);

                // Send configuration message
                const configMessage = {
                    api_key: sonioxApiKey,
                    model: config.model || 'stt-rt-preview', // Official WebSocket API model
                    include_nonfinal: true,
                    enable_endpoint_detection: true,
                    // Audio format configuration - PCM16, 16kHz, mono
                    // Frontend sends raw PCM16 data from Web Audio API
                    audio_format: 'pcm_s16le',
                    sample_rate_hertz: 16000,
                    sample_rate: 16000,
                    num_channels: 1,
                    num_audio_channels: 1,
                    ...config.sonioxConfig
                };

                // Add translation config if provided
                if (config.translation) {
                    configMessage.translation = config.translation;
                }

                // Add language hints if provided
                if (config.languageHints && config.languageHints.length > 0) {
                    configMessage.language_hints = config.languageHints;
                }

                // Add speaker diarization if enabled
                if (config.enableSpeakerDiarization) {
                    configMessage.enable_speaker_diarization = true;
                }

                // Add language identification if enabled
                if (config.enableLanguageIdentification) {
                    configMessage.enable_language_identification = true;
                }

                ws.send(JSON.stringify(configMessage));
                console.log(`📤 Sent Soniox config for user ${userId}:`, JSON.stringify(configMessage, null, 2));
            };

            ws.onmessage = async (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // Temporarily enable logging to debug
                    console.log(`📥 Soniox message for user ${userId}:`, JSON.stringify(data, null, 2));

                    // Check if this message contains tokens
                    if (data.tokens && data.tokens.length > 0) {
                        // Extract text from all tokens (this is the original transcript)
                        const transcript = this.extractText(data.tokens);

                        // Check if tokens are final
                        const isFinal = data.tokens.some(t => t.is_final);

                        // Check for translation in the data
                        // Soniox may return translation in different ways:
                        // 1. As a separate 'translation' field in the response
                        // 2. As tokens with translation_status
                        // 3. In a separate message
                        let translation = null;

                        // Method 1: Check if there's a translation field
                        if (data.translation) {
                            translation = data.translation;
                            console.log(`📝 Found translation in data.translation: "${translation}"`);
                        }
                        // Method 2: Check if there's a translated_text field
                        else if (data.translated_text) {
                            translation = data.translated_text;
                            console.log(`📝 Found translation in data.translated_text: "${translation}"`);
                        }
                        // Method 3: Check for translation in tokens
                        else if (data.tokens.some(t => t.translation)) {
                            const translationTokens = data.tokens.filter(t => t.translation);
                            translation = translationTokens.map(t => t.translation).join('');
                            console.log(`📝 Found translation in token.translation: "${translation}"`);
                        }
                        // Method 4: Check for separate translation tokens by status
                        else if (data.tokens.some(t => t.translation_status === 'translation')) {
                            const translationTokens = data.tokens.filter(t =>
                                t.translation_status === 'translation'
                            );
                            translation = this.extractText(translationTokens);
                            console.log(`📝 Found translation tokens: "${translation}"`);
                        }

                        const result = {
                            transcript,
                            translation,
                            isFinal,
                            tokens: data.tokens,
                            speaker: data.tokens[0]?.speaker,
                            language: data.tokens[0]?.language
                        };

                        console.log(`📝 Processed result:`, {
                            transcript,
                            translation,
                            isFinal,
                            hasTranslation: !!translation
                        });

                        // Call the callback with the result
                        if (onTranscript) {
                            onTranscript(result);
                        }
                    }

                    // Check for translation-only messages (no tokens or empty tokens)
                    if ((!data.tokens || data.tokens.length === 0) && (data.translation || data.translated_text)) {
                        const translation = data.translation || data.translated_text;
                        console.log(`📝 Received translation-only message: "${translation}"`);

                        const result = {
                            transcript: '',
                            translation,
                            isFinal: true,
                            tokens: [],
                            speaker: undefined,
                            language: undefined
                        };

                        if (onTranscript) {
                            onTranscript(result);
                        }
                    }

                    if (data.error_code) {
                        console.error(`❌ Soniox error for user ${userId}:`, data);
                        if (onError) {
                            onError(data.error_code, data.error_message);
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error processing Soniox message for user ${userId}:`, error);
                    if (onError) {
                        onError('processing_error', error.message);
                    }
                }
            };

            ws.onerror = (error) => {
                console.error(`❌ Soniox WebSocket error for user ${userId}:`, error);
                console.error(`❌ Error details:`, {
                    type: error.type,
                    message: error.message,
                    target: error.target?.url
                });
                if (onError) {
                    onError('websocket_error', error.message || 'WebSocket connection failed');
                }
            };

            ws.onclose = (event) => {
                console.log(`🔌 Soniox WebSocket closed for user ${userId}`, {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });

                // If connection closed unexpectedly, notify error
                if (!event.wasClean && onError) {
                    onError('websocket_error', `Connection closed unexpectedly: ${event.reason || 'Unknown reason'}`);
                }

                this.connections.delete(userId);
            };

            // Store connection
            this.connections.set(userId, { ws, config });

            return true;
        } catch (error) {
            console.error(`❌ Error initializing Soniox for user ${userId}:`, error);
            if (onError) {
                onError('initialization_error', error.message);
            }
            return false;
        }
    }

    /**
     * Send audio chunk to Soniox
     * @param {string} userId - User ID
     * @param {Buffer} audioChunk - Audio data (PCM16 or WAV)
     */
    sendAudioChunk(userId, audioChunk) {
        const connection = this.connections.get(userId);
        if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
            console.warn(`⚠️ Soniox connection not ready for user ${userId}`);
            return false;
        }

        try {
            // Send audio data as binary
            connection.ws.send(audioChunk);
            return true;
        } catch (error) {
            console.error(`❌ Error sending audio chunk for user ${userId}:`, error);
            return false;
        }
    }

    /**
     * Finalize transcription (flush remaining audio)
     * @param {string} userId - User ID
     */
    finalize(userId) {
        const connection = this.connections.get(userId);
        if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
            console.warn(`⚠️ Soniox connection not ready for user ${userId}`);
            return false;
        }

        try {
            // Send empty message to finalize
            connection.ws.send(Buffer.alloc(0));
            console.log(`✅ Finalized Soniox transcription for user ${userId}`);
            return true;
        } catch (error) {
            console.error(`❌ Error finalizing for user ${userId}:`, error);
            return false;
        }
    }

    /**
     * Close Soniox connection
     * @param {string} userId - User ID
     */
    closeConnection(userId) {
        const connection = this.connections.get(userId);
        if (connection) {
            try {
                if (connection.ws.readyState === WebSocket.OPEN) {
                    connection.ws.close();
                }
                this.connections.delete(userId);
                console.log(`🔌 Closed Soniox connection for user ${userId}`);
            } catch (error) {
                console.error(`❌ Error closing Soniox connection for user ${userId}:`, error);
            }
        }
    }

    /**
     * Extract text from tokens
     * @param {Array} tokens - Soniox tokens
     * @returns {string} - Extracted text
     */
    extractText(tokens) {
        if (!tokens || tokens.length === 0) return '';
        return tokens.map(token => token.text).join('');
    }

    /**
     * Convert text to speech using Cartesia REST API
     * @param {string} userId - User ID
     * @param {string} text - Text to convert
     * @param {string} voiceId - Cartesia voice ID
     * @returns {Promise<Buffer>} - Audio buffer
     */
    async textToSpeech(userId, text, voiceId = 'a0e99841-438c-4a64-b679-ae501e7d6091') {
        try {
            console.log(`🔊 Converting text to speech for user ${userId}:`, text);

            let apiKey = process.env.CARTESIA_API_KEY;

            try {
                const settings = await WebsiteSettings.getSettings();
                if (settings.ai && settings.ai.cartesia && settings.ai.cartesia.key) {
                    apiKey = settings.ai.cartesia.key;
                }
            } catch (err) {
                console.error('Error fetching settings for Cartesia TTS:', err);
            }

            if (!apiKey) {
                throw new Error('CARTESIA_API_KEY not configured');
            }

            // Use direct HTTP POST to Cartesia REST API
            const axios = require('axios');
            const response = await axios.post(
                'https://api.cartesia.ai/tts/bytes',
                {
                    model_id: 'sonic-english',
                    transcript: text,
                    voice: {
                        mode: 'id',
                        id: voiceId
                    },
                    output_format: {
                        container: 'raw',
                        encoding: 'pcm_s16le',
                        sample_rate: 24000
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Cartesia-Version': '2024-06-10',
                        'Content-Type': 'application/json'
                    },
                    responseType: 'arraybuffer'
                }
            );

            const audioBuffer = Buffer.from(response.data);
            console.log(`✅ Generated audio for user ${userId}, size: ${audioBuffer.length} bytes`);

            return audioBuffer;
        } catch (error) {
            console.error(`❌ Error in TTS for user ${userId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Clean up all connections
     */
    cleanup() {
        console.log(`🧹 Cleaning up ${this.connections.size} Soniox connections`);
        for (const [userId] of this.connections) {
            this.closeConnection(userId);
        }
    }
}

module.exports = new SonioxService();
