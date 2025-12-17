# Real-Time Translation System - How It Works

## Overview
The real-time translation feature allows users in a video call to hear each other's speech translated into their preferred language using Soniox STT (Speech-to-Text) with built-in translation and Cartesia TTS (Text-to-Speech).

## User Interface

### Translation Controls
When you click the 🌐 globe icon during a video call, you'll see:

```
┌────────────────────────────────┐
│ Real-Time Translation          │
├────────────────────────────────┤
│ They Speak: [Hindi      ▼]     │
│ I Hear:     [English    ▼]     │
│                                 │
│ 💡 Translates the other        │
│    person's speech into your   │
│    language                     │
│                                 │
│ [Enable Translation]            │
└────────────────────────────────┘
```

### What Each Setting Means

- **They Speak**: The language the OTHER person is speaking
- **I Hear**: The language YOU want to hear their speech in

**Important**: You cannot select the same language for both (e.g., English → English). Translation requires converting from one language to another.

## How Translation Works

### Example Scenario
**Andria** (speaks English) is on a call with **Zainab** (speaks Hindi)

#### For Andria to hear Zainab's Hindi in English:
**Zainab enables translation:**
- They Speak: Hindi
- I Hear: English
- Result: When Zainab speaks Hindi → Andria hears English ✅

#### For Zainab to hear Andria's English in Hindi:
**Andria enables translation:**
- They Speak: English
- I Hear: Hindi
- Result: When Andria speaks English → Zainab hears Hindi ✅

### Both Users Can Enable Translation
For a fully translated conversation, **both users** should enable translation with their respective settings.

## Technical Flow

### 1. User Enables Translation
```
Frontend (TranslationControls.tsx)
  ↓
  User clicks "Enable Translation"
  ↓
  Validates: sourceLanguage ≠ targetLanguage
  ↓
  Emits 'enable-translation' event to backend
```

### 2. Backend Initializes Soniox
```
Backend (socketService.js)
  ↓
  Receives 'enable-translation' event
  ↓
  Calls sonioxService.initializeConnection()
  ↓
  Opens WebSocket to Soniox API
  ↓
  Sends configuration with translation settings
```

### 3. Audio Capture & Processing
```
Frontend (useRealtimeTranslation.ts)
  ↓
  Captures microphone audio (16kHz, mono, PCM16)
  ↓
  Sends audio chunks via 'translation-audio-chunk' event
  ↓
Backend (socketService.js)
  ↓
  Forwards audio to Soniox WebSocket
  ↓
Soniox API
  ↓
  Transcribes speech
  ↓
  Translates to target language
  ↓
  Returns tokens with translation
```

### 4. Text-to-Speech & Playback
```
Backend (sonioxService.js)
  ↓
  Receives translation from Soniox
  ↓
  Calls Cartesia TTS API
  ↓
  Generates audio (24kHz PCM16)
  ↓
  Emits 'translation-audio' to OTHER participants
  ↓
Frontend (useRealtimeTranslation.ts)
  ↓
  Receives translated audio
  ↓
  Plays via WavStreamPlayer
```

## Supported Languages

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)
- Hindi (hi)
- Urdu (ur)
- Turkish (tr)
- Dutch (nl)
- Polish (pl)
- Swedish (sv)
- Norwegian (no)
- Danish (da)
- Finnish (fi)

## Common Issues & Solutions

### Issue: "Translation not working"
**Symptoms**: No translation appears, or translation is null

**Possible Causes**:
1. ✅ **Same language selected**: Source and target are the same (e.g., en → en)
   - **Solution**: Select different languages

2. ✅ **Only one user enabled translation**: Translation must be enabled by the person speaking
   - **Solution**: The person whose speech needs translation should enable it

3. ✅ **Soniox API key missing**: Backend can't connect to Soniox
   - **Solution**: Check `SONIOX_API_KEY` in `.env`

4. ✅ **Soniox balance exhausted**: No credits remaining
   - **Solution**: Add funds to Soniox account or enable autopay

### Issue: "Connection stuck in 'connecting'"
**Symptoms**: WebRTC shows "connecting" but never "connected"

**This is a separate WebRTC issue**, not related to translation. Translation can still work even if connection state shows "connecting".

### Issue: "Audio not playing"
**Symptoms**: Translation text appears but no audio

**Possible Causes**:
1. WavStreamPlayer not initialized
2. Browser audio permissions denied
3. Cartesia TTS error

**Solution**: Check browser console for errors

## Debug Logs

### Backend Logs to Watch For:
```
🎙️ Initializing Soniox WebSocket for user...
✅ Soniox WebSocket opened for user...
📤 Sent Soniox config for user...
📥 Soniox message for user...
📝 Translation result for...
🔊 Generating TTS for...
🔊 Sent translation audio to room...
```

### Frontend Logs to Watch For:
```
✅ Translation enabled
🎙️ Starting real-time translation...
✅ Got user media stream
📝 Translation result: { transcript, translation, isFinal }
🔊 Received translation audio from: [username]
▶️ Playing translated audio
```

## Configuration Files

### Frontend
- `frontend/src/components/TranslationControls.tsx` - UI controls
- `frontend/src/hooks/useRealtimeTranslation.ts` - Audio capture & playback

### Backend
- `backend/services/socketService.js` - Socket event handlers
- `backend/services/sonioxService.js` - Soniox WebSocket & Cartesia TTS

### Environment Variables
```env
SONIOX_API_KEY=your_soniox_api_key_here
CARTESIA_API_KEY=your_cartesia_api_key_here
```

## API Keys Required

1. **Soniox API Key**: For speech-to-text with translation
   - Get from: https://soniox.com/
   - Add to `.env` as `SONIOX_API_KEY`

2. **Cartesia API Key**: For text-to-speech
   - Get from: https://cartesia.ai/
   - Add to `.env` as `CARTESIA_API_KEY`

## Testing Translation

### Step-by-Step Test:
1. Open two browser windows (or use incognito for second user)
2. Log in as two different users
3. Start a video call between them
4. **User 1** clicks 🌐 and sets:
   - They Speak: English
   - I Hear: Hindi
   - Click "Enable Translation"
5. **User 2** clicks 🌐 and sets:
   - They Speak: Hindi
   - I Hear: English
   - Click "Enable Translation"
6. **User 1** speaks in English
7. **User 2** should hear Hindi translation
8. **User 2** speaks in Hindi
9. **User 1** should hear English translation

### Expected Logs:
```
// User 1 enables translation
🌐 Translation enabled by User1: { roomId, targetLanguage: 'hi', sourceLanguage: 'en' }
🎙️ Initializing Soniox WebSocket for user User1...
✅ Translation enabled for User1

// User 1 speaks
📥 Soniox message for user User1: { tokens: [...], translation_status: 'translation' }
📝 Translation result: { transcript: 'Hello', translation: 'नमस्ते', isFinal: true }
🔊 Generating TTS for: "नमस्ते"
🔊 Sent translation audio to room

// User 2 receives
🔊 Received translation audio from: User1
▶️ Playing translated audio
```

## Architecture Diagram

```
┌─────────────┐                    ┌─────────────┐
│   User A    │                    │   User B    │
│  (English)  │                    │   (Hindi)   │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │ Speaks English                   │ Speaks Hindi
       ↓                                  ↓
┌──────────────┐                   ┌──────────────┐
│  Frontend A  │                   │  Frontend B  │
│  (Captures   │                   │  (Captures   │
│   Audio)     │                   │   Audio)     │
└──────┬───────┘                   └──────┬───────┘
       │                                  │
       │ PCM16 Audio Chunks               │ PCM16 Audio Chunks
       ↓                                  ↓
       ┌────────────────────────────────┐
       │         Backend Server          │
       │      (Socket.IO + Soniox)       │
       └────────┬──────────────┬─────────┘
                │              │
       ┌────────↓──────┐  ┌───↓─────────┐
       │  Soniox API   │  │ Cartesia TTS│
       │  (Translate)  │  │  (Audio)    │
       └────────┬──────┘  └───┬─────────┘
                │              │
       ┌────────↓──────────────↓─────────┐
       │   Translation Result + Audio    │
       └────────┬──────────────┬─────────┘
                │              │
       ┌────────↓──────┐  ┌───↓─────────┐
       │  Frontend B   │  │ Frontend A  │
       │  (Plays Hindi)│  │(Plays Eng.) │
       └───────────────┘  └─────────────┘
```

## Summary

The translation system is designed so that **each user translates their own speech** for the other person to hear. This means:

- If you want to hear the other person's speech translated, **they** need to enable translation
- If you want the other person to hear your speech translated, **you** need to enable translation
- For a fully translated conversation, **both users** should enable translation

The new UI labels ("They Speak" / "I Hear") make this clearer by focusing on what you'll hear, rather than what you're speaking.
