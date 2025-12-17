const { createClient } = require('@deepgram/sdk');
const dotenv = require('dotenv');
const path = require('path');

// Load env from one level up (backend root)
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.DEEPGRAM_API_KEY;

if (!apiKey) {
    console.error("❌ DEEPGRAM_API_KEY is not set in .env");
    process.exit(1);
}

const masked = apiKey.substring(0, 4) + '...' + apiKey.slice(-4);
console.log(`🔑 Using API Key: ${masked}`);

const deepgram = createClient(apiKey);

async function testConnection() {
    console.log("🎤 Attempting to create Live connection...");

    try {
        const live = deepgram.listen.live({
            model: "nova-2",
            language: "en-US",
            smart_format: true,
        });

        console.log("WAITING for Open event...");

        live.on("Open", () => {
            console.log("✅ Connection OPEN! Deepgram is reachable and key is valid.");

            // Send some silence
            const silence = Buffer.alloc(1000);
            live.send(silence);
            console.log("📤 Sent silence buffer.");

            setTimeout(() => {
                console.log("🛑 Closing connection...");
                live.finish();
            }, 2000);
        });

        live.on("Close", (e) => {
            console.log("❌ Connection CLOSED.", e);
        });

        live.on("Error", (e) => {
            console.error("❌ Connection ERROR:", e);
        });

        live.on("Metadata", (m) => {
            console.log("ℹ️ Received Metadata:", m);
        });

        // Wait a bit to ensure async events can fire
        setTimeout(() => {
            if (live.getReadyState() === 3) {
                console.error("❌ Timeout reached. State is 3 (Closed). It failed to open.");
                process.exit(1);
            }
        }, 5000);

    } catch (err) {
        console.error("❌ Exception:", err);
    }
}

testConnection();
