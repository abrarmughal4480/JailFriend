// Test Soniox WebSocket connection
const WebSocket = require('ws');
require('dotenv').config();

const sonioxApiKey = process.env.SONIOX_API_KEY;

console.log('🔑 Testing Soniox connection...');
console.log('API Key exists:', !!sonioxApiKey);
console.log('API Key length:', sonioxApiKey?.length);
console.log('API Key first 10 chars:', sonioxApiKey?.substring(0, 10) + '...');

const ws = new WebSocket('wss://api.soniox.com/transcribe-websocket');

ws.onopen = () => {
    console.log('✅ WebSocket opened successfully!');

    const config = {
        api_key: sonioxApiKey,
        model: 'stt-rt-preview',
        include_nonfinal: true
    };

    console.log('📤 Sending config:', config);
    ws.send(JSON.stringify(config));
};

ws.onmessage = (event) => {
    console.log('📥 Message received:', event.data);
};

ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error.message);
};

ws.onclose = (event) => {
    console.log('🔌 WebSocket closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
    });
    process.exit(event.wasClean ? 0 : 1);
};

// Close after 5 seconds
setTimeout(() => {
    console.log('⏱️ Test complete, closing connection...');
    ws.close();
}, 5000);
