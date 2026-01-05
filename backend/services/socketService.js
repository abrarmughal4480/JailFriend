const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/message');
const User = require('../models/user');
const Conversation = require('../models/conversation');
const sonioxService = require('./sonioxService');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId mapping
    this.pulseData = new Map(); // pulse monitoring data
    this.pulseTimeoutMs = 20000; // 20 seconds timeout
    this.pulseCheckInterval = null;
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:3001',
          'https://jaifriend.hgdjlive.com',
          'https://jaifriend-backend.hgdjlive.com',
          'https://jaifriend.com',
          'https://backend.jaifriend.com/',
          'https://Frontend.jaifriend.com',
          'https://api.jaifriend.com'
        ],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.use(this.authenticateSocket.bind(this));
    this.setupEventHandlers();
    this.startPulseMonitoring();



    console.log('🔌 Socket.IO service initialized');
  }

  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      console.log('🔐 Socket authentication attempt:', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        authHeader: socket.handshake.auth,
        authHeaders: socket.handshake.headers.authorization ? 'Present' : 'Missing'
      });

      if (!token) {
        console.error('❌ No token provided for socket authentication');
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development-only');
      console.log('🔐 Token decoded successfully:', { userId: decoded.userId, id: decoded.id });

      // Use userId from token (as set in authController)
      const userId = decoded.userId || decoded.id;
      console.log('🔐 Using userId:', userId);

      const user = await User.findById(userId).select('_id name username avatar isOnline');

      if (!user) {
        console.error('❌ User not found in database:', userId);
        return next(new Error('Authentication error: User not found'));
      }

      console.log('✅ User authenticated successfully:', {
        id: user._id,
        name: user.name,
        username: user.username
      });

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error('❌ Socket authentication error:', error.message);
      next(new Error('Authentication error: Invalid token'));
    }
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.user.name} (${socket.userId})`);

      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);

      // Update user online status
      this.updateUserOnlineStatus(socket.userId, true);

      // Join user to their personal room
      socket.join(`user_${socket.userId}`);

      // Handle joining conversation rooms
      socket.on('join_conversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`👥 User ${socket.user.name} joined conversation ${conversationId}`);
      });

      // Handle leaving conversation rooms
      socket.on('leave_conversation', (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
        console.log(`👥 User ${socket.user.name} left conversation ${conversationId}`);
      });

      // Handle sending messages
      socket.on('send_message', async (data) => {
        try {
          const { conversationId, content, type = 'text', replyTo, media } = data;

          console.log(`💬 Message from ${socket.user.name} to conversation ${conversationId}:`, content);

          // Parse conversation ID to get receiver ID
          const [userId1, userId2] = conversationId.split('-');
          const receiverId = userId1 === socket.userId ? userId2 : userId1;

          // Save message to database
          const messageDoc = new Message({
            senderId: socket.userId,
            receiverId: receiverId,
            content: content,
            messageType: type,
            mediaUrl: media || '',
            replyTo: replyTo || null,
            conversationContext: {
              type: 'regular',
              source: 'regular_message'
            }
          });

          const savedMessage = await messageDoc.save();

          // Create or update conversation
          await this.createOrUpdateConversation(socket.userId, receiverId, savedMessage._id, {
            type: 'regular',
            p2pContext: {}
          });

          // Populate sender and receiver details
          await savedMessage.populate([
            { path: 'senderId', select: 'name username avatar' },
            { path: 'receiverId', select: 'name username avatar' },
            { path: 'replyTo', select: 'content senderId' }
          ]);

          // Create message object for socket emission
          const message = {
            _id: savedMessage._id,
            conversationId,
            content: savedMessage.content,
            sender: {
              _id: savedMessage.senderId._id,
              name: savedMessage.senderId.name,
              username: savedMessage.senderId.username,
              avatar: savedMessage.senderId.avatar
            },
            receiver: {
              _id: savedMessage.receiverId._id,
              name: savedMessage.receiverId.name,
              username: savedMessage.receiverId.username,
              avatar: savedMessage.receiverId.avatar
            },
            timestamp: savedMessage.createdAt.toISOString(),
            type: savedMessage.messageType,
            media: savedMessage.mediaUrl,
            replyTo: savedMessage.replyTo,
            isRead: savedMessage.isRead
          };

          // Broadcast message to conversation participants (excluding sender)
          socket.to(`conversation_${conversationId}`).emit('new_message', message);

          console.log(`📡 Broadcasting message to conversation_${conversationId} (excluding sender: ${socket.userId})`);

          // Send notification to offline participants
          this.sendMessageNotification(conversationId, message, socket.userId);

        } catch (error) {
          console.error('Error handling send_message:', error);
          socket.emit('message_error', { error: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        const { conversationId } = data;
        socket.to(`conversation_${conversationId}`).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.name,
          conversationId
        });
      });

      socket.on('typing_stop', (data) => {
        const { conversationId } = data;
        socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
          userId: socket.userId,
          conversationId
        });
      });

      // Handle message read status
      socket.on('mark_message_read', (data) => {
        const { conversationId, messageId } = data;
        socket.to(`conversation_${conversationId}`).emit('message_read', {
          messageId,
          userId: socket.userId,
          conversationId
        });
      });

      // Handle audio call events
      socket.on('initiate_call', async (data) => {
        const { receiverId, callType = 'audio', callId } = data;
        console.log(`📞 Call initiated from ${socket.user.name} to user ${receiverId}`);

        // Send call invitation to receiver with actual call ID
        socket.to(`user_${receiverId}`).emit('incoming_call', {
          callId: callId, // Use the actual call ID from database
          callerId: socket.userId,
          caller: {
            _id: socket.user._id,
            name: socket.user.name,
            username: socket.user.username,
            avatar: socket.user.avatar
          },
          callType,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('accept_call', (data) => {
        const { callId, callerId } = data;
        console.log(`📞 Call accepted by ${socket.user.name} for call ${callId}`);
        // Notify caller that call was accepted
        socket.to(`user_${callerId}`).emit('call_accepted', {
          callId,
          receiverId: socket.userId,
          receiver: {
            _id: socket.user._id,
            name: socket.user.name,
            username: socket.user.username,
            avatar: socket.user.avatar
          },
          timestamp: new Date().toISOString()
        });

        console.log(`📞 Call accepted event sent to user_${callerId}`);
      });

      socket.on('reject_call', (data) => {
        const { callId, callerId, reason } = data;
        console.log(`📞 Call rejected by ${socket.user.name} for call ${callId}`);

        // Notify caller that call was rejected
        socket.to(`user_${callerId}`).emit('call_rejected', {
          callId,
          receiverId: socket.userId,
          reason: reason || 'user_rejected',
          timestamp: new Date().toISOString()
        });
      });

      socket.on('end_call', (data) => {
        const { callId, otherUserId } = data;
        console.log(`📞 Call ended by ${socket.user.name} for call ${callId}`);

        // Notify other participant that call ended
        socket.to(`user_${otherUserId}`).emit('call_ended', {
          callId,
          endedBy: socket.userId,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('cancel_call', (data) => {
        const { callId, receiverId } = data;
        console.log(`📞 Call cancelled by ${socket.user.name} for call ${callId}`);

        // Notify receiver that call was cancelled
        socket.to(`user_${receiverId}`).emit('call_cancelled', {
          callId,
          callerId: socket.userId,
          timestamp: new Date().toISOString()
        });
      });

      // WebRTC signaling events
      socket.on('webrtc_offer', (data) => {
        const { callId, offer, receiverId } = data;
        console.log(`📞 WebRTC offer event received:`, JSON.stringify(data));
        console.log(`📞 WebRTC offer sent from ${socket.user.name} to user ${receiverId}`);

        // Forward offer to receiver
        socket.to(`user_${receiverId}`).emit('webrtc_offer', {
          callId,
          offer,
          senderId: socket.userId,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('webrtc_answer', (data) => {
        const { callId, answer, callerId } = data;
        console.log(`📞 WebRTC answer event received:`, JSON.stringify(data));
        console.log(`📞 WebRTC answer sent from ${socket.user.name} to user ${callerId}`);

        // Forward answer to caller
        socket.to(`user_${callerId}`).emit('webrtc_answer', {
          callId,
          answer,
          senderId: socket.userId,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('webrtc_ice_candidate', (data) => {
        const { callId, candidate, receiverId, callerId } = data;
        const targetId = receiverId || callerId;

        if (!targetId) {
          console.warn(`⚠️ WebRTC ICE candidate received without targetId from ${socket.user.name}`);
          return;
        }

        // Forward ICE candidate to recipient
        socket.to(`user_${targetId}`).emit('webrtc_ice_candidate', {
          callId,
          candidate,
          senderId: socket.userId,
          timestamp: new Date().toISOString()
        });
      });

      // Handle video call events
      socket.on('join-video-call-service', (data) => {
        const { userId, userName } = data;
        console.log(`📹 User ${userName} (${userId}) joined video call service`, {
          socketId: socket.id,
          userId,
          userName
        });
        // Join user to their personal video call room
        const roomName = `video_user_${userId}`;
        socket.join(roomName);
        console.log(`📹 User joined video call room: ${roomName}`);

        // Notify all users in the room that a user has joined
        socket.to(roomName).emit('user-joined-video-service', {
          userId,
          userName,
          socketId: socket.id
        });
      });

      socket.on('initiate-video-call', (data) => {
        const { callerId, callerName, receiverId, receiverName, callId } = data;
        console.log(`📹 Video call initiated from ${callerName} to ${receiverName}`, {
          callerId,
          callerName,
          receiverId,
          receiverName,
          callId,
          socketId: socket.id
        });

        // Check if receiver room exists
        const receiverRoom = `video_user_${receiverId}`;
        const room = this.io.sockets.adapter.rooms.get(receiverRoom);
        console.log(`🔍 DEBUG: Receiver room ${receiverRoom} exists:`, room ? Array.from(room) : 'Room not found');

        // If receiver room doesn't exist, try to find the receiver's socket and join them to the room
        if (!room) {
          console.log(`🔍 DEBUG: Receiver room not found, attempting to find receiver socket...`);
          // Find all connected sockets and check if any belong to the receiver
          const allSockets = Array.from(this.io.sockets.sockets.values());
          const receiverSocket = allSockets.find(s => s.userId === receiverId);

          if (receiverSocket) {
            console.log(`🔍 DEBUG: Found receiver socket, joining to video call room:`, receiverSocket.id);
            receiverSocket.join(receiverRoom);
            console.log(`🔍 DEBUG: Receiver joined video call room: ${receiverRoom}`);
          } else {
            console.log(`🔍 DEBUG: Receiver socket not found for user: ${receiverId}`);
          }
        }

        // Send video call invitation to receiver
        socket.to(receiverRoom).emit('incoming-video-call', {
          callerId,
          callerName,
          receiverId,
          receiverName,
          callId,
          timestamp: new Date().toISOString()
        });

        // Also notify the caller that the invitation was sent
        socket.emit('video-call-invitation-sent', {
          receiverId,
          receiverName,
          callId,
          timestamp: new Date().toISOString()
        });

        console.log(`📡 Video call invitation sent to room ${receiverRoom}`);
      });

      socket.on('accept-video-call', (data) => {
        const { callId, receiverId, receiverName, callerId } = data;
        console.log(`📹 Video call accepted by ${receiverName} for call ${callId}`);

        // Notify caller that video call was accepted
        socket.to(`video_user_${callerId}`).emit('video-call-accepted', {
          callId,
          receiverId,
          receiverName,
          timestamp: new Date().toISOString()
        });

        // Also notify the receiver to start their connection
        socket.to(`video_user_${receiverId}`).emit('start-video-connection', {
          callId,
          callerId,
          receiverId,
          timestamp: new Date().toISOString()
        });

        // Also notify the caller to retry sending the offer
        socket.to(`video_user_${callerId}`).emit('retry-offer-after-accept', {
          callId,
          receiverId,
          timestamp: new Date().toISOString()
        });

        console.log(`📡 Video call acceptance notification sent to caller ${callerId}`);
        console.log(`📡 Start connection signal sent to receiver ${receiverId}`);
        console.log(`📡 Retry offer signal sent to caller ${callerId}`);
      });

      socket.on('decline-video-call', (data) => {
        const { callId, receiverId, callerId } = data;
        console.log(`📹 Video call declined by user ${receiverId} for call ${callId}`);

        // Notify caller that video call was declined
        socket.to(`video_user_${callerId}`).emit('video-call-declined', {
          callId,
          receiverId,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('end-video-call', (data) => {
        const { callId, userId } = data;
        console.log(`📹 Video call ended by user ${userId} for call ${callId}`);

        // Notify all participants that video call ended
        socket.broadcast.emit('video-call-ended', {
          callId,
          userId,
          timestamp: new Date().toISOString()
        });
      });

      // Handle user authentication for WebRTC
      socket.on('user-authenticated', (authData) => {
        console.log(`📹 User authenticated for WebRTC:`, authData.email);
        // User is already authenticated via socket middleware
      });

      // Handle joining video call rooms
      socket.on('join-room', (roomId, data) => {
        console.log(`🔍 DEBUG: join-room event received`, {
          userId: socket.userId,
          userName: socket.user.name,
          roomId: roomId,
          data: data,
          socketId: socket.id
        });

        // Join the room
        socket.join(roomId);

        // Verify room membership
        const room = this.io.sockets.adapter.rooms.get(roomId);
        const roomMembers = room ? Array.from(room) : [];
        console.log(`📹 User ${socket.user.name} joined video call room ${roomId}`, data || '');
        console.log(`🔍 DEBUG: Room ${roomId} now has ${roomMembers.length} member(s):`, roomMembers);

        // Notify the client that they successfully joined
        socket.emit('room-joined', {
          roomId: roomId,
          memberCount: roomMembers.length,
          members: roomMembers
        });

        // Notify other members in the room that a new user joined
        socket.to(roomId).emit('user-joined-room', {
          roomId: roomId,
          userId: socket.userId,
          userName: socket.user.name,
          socketId: socket.id,
          memberCount: roomMembers.length
        });
      });

      // Handle WebRTC signaling for video calls
      socket.on('offer', (offer, roomId) => {
        console.log(`🔍 DEBUG: offer event received`, {
          userId: socket.userId,
          userName: socket.user.name,
          roomId: roomId,
          offerType: offer.type,
          socketId: socket.id
        });
        console.log(`📹 WebRTC offer received from ${socket.user.name} for room ${roomId}`);

        // Ensure sender is in the room
        if (!socket.rooms.has(roomId)) {
          console.log(`🔍 DEBUG: Sender not in room ${roomId}, joining now...`);
          socket.join(roomId);
        }

        // Check room members before forwarding
        const room = this.io.sockets.adapter.rooms.get(roomId);
        const roomMembers = room ? Array.from(room) : [];
        console.log(`🔍 DEBUG: Room ${roomId} members:`, roomMembers);

        if (roomMembers.length < 2) {
          console.warn(`⚠️ WARNING: Room ${roomId} has less than 2 members (${roomMembers.length}). Offer may not be delivered.`);
          // Still try to forward, but log warning
        }

        // Forward offer to other participants in the room
        socket.to(roomId).emit('offer', offer);
        console.log(`🔍 DEBUG: offer forwarded to room ${roomId} (excluding sender ${socket.id})`);
      });

      socket.on('answer', (answer, roomId) => {
        console.log(`🔍 DEBUG: answer event received`, {
          userId: socket.userId,
          userName: socket.user.name,
          roomId: roomId,
          answerType: answer.type,
          socketId: socket.id
        });
        console.log(`📹 WebRTC answer received from ${socket.user.name} for room ${roomId}`);

        // Ensure sender is in the room
        if (!socket.rooms.has(roomId)) {
          console.log(`🔍 DEBUG: Sender not in room ${roomId}, joining now...`);
          socket.join(roomId);
        }

        // Check room members before forwarding
        const room = this.io.sockets.adapter.rooms.get(roomId);
        const roomMembers = room ? Array.from(room) : [];
        console.log(`🔍 DEBUG: Room ${roomId} members:`, roomMembers);

        if (roomMembers.length < 2) {
          console.warn(`⚠️ WARNING: Room ${roomId} has less than 2 members (${roomMembers.length}). Answer may not be delivered.`);
        }

        // Forward answer to other participants in the room
        socket.to(roomId).emit('answer', answer);
        console.log(`🔍 DEBUG: answer forwarded to room ${roomId} (excluding sender ${socket.id})`);
      });

      socket.on('ice-candidate', (candidate, roomId) => {
        console.log(`🔍 DEBUG: ice-candidate event received`, {
          userId: socket.userId,
          userName: socket.user.name,
          roomId: roomId,
          candidateType: candidate.candidate,
          socketId: socket.id
        });
        console.log(`📹 ICE candidate received from ${socket.user.name} for room ${roomId}`);

        // Ensure sender is in the room
        if (!socket.rooms.has(roomId)) {
          console.log(`🔍 DEBUG: Sender not in room ${roomId}, joining now...`);
          socket.join(roomId);
        }

        // Check room members before forwarding
        const room = this.io.sockets.adapter.rooms.get(roomId);
        const roomMembers = room ? Array.from(room) : [];

        if (roomMembers.length < 2) {
          console.warn(`⚠️ WARNING: Room ${roomId} has less than 2 members (${roomMembers.length}). ICE candidate may not be delivered.`);
        }

        // Forward ICE candidate to other participants in the room
        socket.to(roomId).emit('ice-candidate', candidate);
        console.log(`🔍 DEBUG: ice-candidate forwarded to room ${roomId} (excluding sender ${socket.id})`);
      });

      // Handle offer retry requests
      socket.on('request-offer-retry', (data) => {
        const { roomId, userId } = data;
        console.log(`🔍 DEBUG: request-offer-retry event received`, {
          userId: socket.userId,
          userName: socket.user.name,
          roomId: roomId,
          requestingUserId: userId,
          socketId: socket.id
        });

        // Forward retry request to other participants in the room
        socket.to(roomId).emit('offer-retry', {
          roomId: roomId,
          requestedBy: socket.userId,
          timestamp: new Date().toISOString()
        });
        console.log(`🔍 DEBUG: Offer retry request forwarded to room ${roomId}`);
      });

      socket.on('user-disconnected', (roomId) => {
        console.log(`📹 User ${socket.user.name} disconnected from room ${roomId}`);
        // Notify other participants that user disconnected
        socket.to(roomId).emit('user-disconnected');
      });

      // Pulse system for video call monitoring
      socket.on('video-call-pulse', (pulseData) => {
        console.log(`💓 Pulse received from ${socket.user.name}:`, {
          roomId: pulseData.roomId,
          userId: pulseData.userId,
          isAdmin: pulseData.isAdmin,
          connectionState: pulseData.connectionState,
          timestamp: pulseData.timestamp
        });

        // Forward pulse to other participants in the room
        socket.to(pulseData.roomId).emit('video-call-pulse', {
          ...pulseData,
          senderId: socket.userId,
          senderName: socket.user.name
        });

        // Store pulse data for timeout monitoring
        if (!this.pulseData) {
          this.pulseData = new Map();
        }

        const pulseKey = `${pulseData.roomId}_${pulseData.userId}`;
        this.pulseData.set(pulseKey, {
          ...pulseData,
          lastReceived: Date.now(),
          socketId: socket.id
        });
      });

      // Real-time translation handlers
      socket.on('enable-translation', async (data) => {
        console.log('🔍 DEBUG: enable-translation event received', {
          hasData: !!data,
          userId: socket.userId,
          userName: socket.user?.name,
          data
        });

        const { roomId, targetLanguage, sourceLanguage, translationType = 'one_way', ttsVoice, callId } = data;
        console.log(`🌐 Translation enabled by ${socket.user.name}:`, {
          roomId,
          targetLanguage,
          sourceLanguage,
          translationType,
          userId: socket.userId,
          callId
        });

        // Check authorization
        const VideoCall = require('../models/videoCall');
        const AudioCall = require('../models/audioCall');

        let call = await VideoCall.findById(callId || roomId); // Try both as sometimes they send callId or roomId
        if (!call) {
          call = await AudioCall.findById(callId || roomId);
        }

        if (!call || !call.hasRealtimeTranslation) {
          console.log(`❌ Translation unauthorized for user ${socket.user.name} in call ${callId || roomId}`);
          socket.emit('translation-error', {
            error: 'Feature not enabled',
            message: 'Real-time translation is not enabled for this call.'
          });
          return;
        }

        // Configure translation based on type
        let translationConfig;
        if (translationType === 'two_way' && sourceLanguage && targetLanguage) {
          translationConfig = {
            type: 'two_way',
            language_a: sourceLanguage,
            language_b: targetLanguage
          };
        } else if (translationType === 'one_way' && targetLanguage) {
          translationConfig = {
            type: 'one_way',
            target_language: targetLanguage
          };
        } else {
          socket.emit('translation-error', {
            error: 'Invalid translation configuration',
            message: 'Please provide valid source and target languages'
          });
          return;
        }

        // Initialize Soniox connection
        // Create unique language hints array (Soniox requires unique values)
        const languageHints = sourceLanguage
          ? Array.from(new Set([sourceLanguage, targetLanguage]))
          : [targetLanguage];

        const success = await sonioxService.initializeConnection(
          socket.userId,
          {
            model: 'stt-rt-preview', // Official WebSocket API model
            translation: translationConfig,
            languageHints,
            enableSpeakerDiarization: false,
            enableLanguageIdentification: true, // Supported in WebSocket API
            enableEndpointDetection: true,
            enableTTS: true,
            ttsVoice: ttsVoice || 'a0e99841-438c-4a64-b679-ae501e7d6091', // Default Cartesia voice
            isTranslatingRemote: data.isTranslatingRemote || false
          },
          // onTranscript callback
          async (result) => {
            // Only log final translations, not every partial result
            // console.log(`📝 Translation result for ${socket.user.name}:`, result);

            // Send transcript and translation to the user
            socket.emit('translation-result', {
              roomId,
              transcript: result.transcript,
              translation: result.translation,
              isFinal: result.isFinal,
              speaker: result.speaker,
              language: result.language
            });

            // If final and has translation, generate audio and send to other user
            if (result.isFinal && result.translation) {
              try {
                console.log(`🔊 Generating TTS for: "${result.translation}"`);
                const audioBuffer = await sonioxService.textToSpeech(
                  socket.userId,
                  result.translation,
                  ttsVoice
                );

                // Decide where to send the audio
                const connection = sonioxService.connections.get(socket.userId);
                const isTranslatingRemote = connection?.config?.isTranslatingRemote;

                const audioData = {
                  audio: audioBuffer,
                  text: result.translation,
                  fromUserId: socket.userId,
                  fromUserName: socket.user.name
                };

                if (isTranslatingRemote) {
                  // If I'm translating the remote person, send the translation back to ME
                  socket.emit('translation-audio', audioData);
                  console.log(`✅ Sent translation audio back to sender ${socket.userId} (translating remote)`);
                } else {
                  // If I'm translating MYSELF, send the translation to OTHERS
                  socket.to(roomId).emit('translation-audio', audioData);
                  console.log(`✅ Sent translation audio to room ${roomId} (excluding sender)`);
                }
              } catch (error) {
                console.error(`❌ Error generating TTS for user ${socket.userId}:`, error);
              }
            }
          },
          // onError callback
          (status, message) => {
            console.error(`❌ Soniox error for ${socket.user.name}:`, status, message);
            socket.emit('translation-error', {
              status,
              message,
              roomId
            });
          }
        );

        if (success) {
          // Notify user that translation is ready
          socket.emit('translation-enabled', {
            roomId,
            translationType,
            sourceLanguage,
            targetLanguage
          });

          // Notify other participants in the room
          socket.to(roomId).emit('user-translation-enabled', {
            userId: socket.userId,
            userName: socket.user.name,
            roomId
          });

          console.log(`✅ Translation enabled for ${socket.user.name}`);
        } else {
          socket.emit('translation-error', {
            error: 'Failed to initialize translation',
            message: 'Could not connect to translation service'
          });
        }
      });

      socket.on('disable-translation', (data) => {
        const { roomId } = data;
        console.log(`🌐 Translation disabled by ${socket.user.name} for room ${roomId}`);

        // Close Soniox connection
        sonioxService.closeConnection(socket.userId);

        // Notify user
        socket.emit('translation-disabled', { roomId });

        // Notify other participants
        socket.to(roomId).emit('user-translation-disabled', {
          userId: socket.userId,
          userName: socket.user.name,
          roomId
        });
      });

      socket.on('translation-audio-chunk', (data) => {
        const { audioChunk, roomId } = data;

        // Only process if Soniox connection exists
        const hasConnection = sonioxService.connections.has(socket.userId);
        if (!hasConnection) {
          // Silently ignore - connection not established yet
          return;
        }

        // Convert to Buffer
        let buffer = Buffer.from(audioChunk);

        // Ensure buffer length is a multiple of 2 (required for PCM16)
        // Each PCM16 sample is 2 bytes, so total length must be even
        if (buffer.length % 2 !== 0) {
          // Trim the last byte if odd length
          buffer = buffer.slice(0, buffer.length - 1);
          console.warn(`⚠️ Trimmed audio chunk from ${audioChunk.length} to ${buffer.length} bytes for user ${socket.userId}`);
        }

        // Send audio chunk to Soniox
        const success = sonioxService.sendAudioChunk(socket.userId, buffer);

        if (!success) {
          console.warn(`⚠️ Failed to send audio chunk for user ${socket.userId}`);
        }
      });

      socket.on('translation-finalize', () => {
        console.log(`🎙️ Finalizing translation for ${socket.user.name}`);
        sonioxService.finalize(socket.userId);
      });

      // Handle user disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.user.name} (${socket.userId})`);

        // Remove user from connected users
        this.connectedUsers.delete(socket.userId);

        // Clean up pulse data for this user
        this.cleanupPulseData(socket.userId);

        // Clean up Soniox translation connection
        sonioxService.closeConnection(socket.userId);

        // Update user offline status
        this.updateUserOnlineStatus(socket.userId, false);
      });
    });
  }

  async updateUserOnlineStatus(userId, isOnline) {
    try {
      await User.findByIdAndUpdate(userId, {
        isOnline,
        lastSeen: isOnline ? null : new Date()
      });

      // Broadcast online status to followers
      this.io.emit('user_status_change', {
        userId,
        isOnline,
        lastSeen: isOnline ? null : new Date()
      });
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  }

  async sendMessageNotification(conversationId, message, senderId) {
    try {
      // Send notification only to conversation participants (excluding sender)
      this.io.to(`conversation_${conversationId}`).emit('message_notification', {
        conversationId,
        message: {
          content: message.content,
          sender: message.sender,
          timestamp: message.timestamp
        },
        senderId
      });

      console.log(`🔔 Sending notification to conversation_${conversationId} (excluding sender: ${senderId})`);
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  }

  // Method to send message to specific user
  sendMessageToUser(userId, message) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('direct_message', message);
      return true;
    }
    return false;
  }

  // Method to emit event to specific user
  emitToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Method to broadcast to all users
  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  // Method to broadcast to specific room
  broadcastToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get all connected users
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  // Helper function to create or update conversation
  async createOrUpdateConversation(senderId, receiverId, messageId, conversationContext = {}) {
    try {
      const sortedIds = [senderId, receiverId].sort();
      const conversationId = `${sortedIds[0]}-${sortedIds[1]}`;

      // Determine conversation type and P2P context
      const conversationType = conversationContext.type || 'regular';
      const p2pContext = conversationContext.p2pContext || {};

      const conversation = await Conversation.findOneAndUpdate(
        { conversationId },
        {
          $set: {
            participants: sortedIds,
            lastMessage: messageId,
            lastMessageAt: new Date(),
            updatedAt: new Date(),
            conversationType,
            p2pContext: {
              ...p2pContext,
              serviceProviderId: p2pContext.serviceProviderId || null,
              clientId: p2pContext.clientId || null
            }
          },
          $setOnInsert: {
            conversationId,
            isP2PUser: conversationType !== 'regular',
            p2pUserId: conversationType !== 'regular' ? receiverId : null,
            unreadCount: new Map(),
            isPinned: false,
            isArchived: false,
            createdAt: new Date()
          }
        },
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      );

      return conversation;
    } catch (error) {
      console.error('Error creating/updating conversation:', error);
      throw error;
    }
  }

  // Pulse monitoring system
  startPulseMonitoring() {
    console.log('💓 Starting pulse monitoring system');

    // Check for pulse timeouts every 10 seconds
    this.pulseCheckInterval = setInterval(() => {
      this.checkPulseTimeouts();
    }, 10000);
  }

  stopPulseMonitoring() {
    console.log('💓 Stopping pulse monitoring system');

    if (this.pulseCheckInterval) {
      clearInterval(this.pulseCheckInterval);
      this.pulseCheckInterval = null;
    }
  }

  checkPulseTimeouts() {
    const now = Date.now();
    const timeoutKeys = [];

    // Check all pulse data for timeouts
    for (const [pulseKey, pulseInfo] of this.pulseData.entries()) {
      const timeSinceLastPulse = now - pulseInfo.lastReceived;

      if (timeSinceLastPulse > this.pulseTimeoutMs) {
        console.log(`💓 Pulse timeout detected for ${pulseKey}:`, {
          timeSinceLastPulse: timeSinceLastPulse,
          timeoutMs: this.pulseTimeoutMs,
          roomId: pulseInfo.roomId,
          userId: pulseInfo.userId
        });

        // Notify other participants in the room about the timeout
        this.io.to(pulseInfo.roomId).emit('video-call-pulse-timeout', {
          roomId: pulseInfo.roomId,
          userId: pulseInfo.userId,
          timeoutDuration: timeSinceLastPulse,
          timestamp: now
        });

        timeoutKeys.push(pulseKey);
      }
    }

    // Remove timed out pulse data
    timeoutKeys.forEach(key => {
      this.pulseData.delete(key);
    });

    if (timeoutKeys.length > 0) {
      console.log(`💓 Removed ${timeoutKeys.length} timed out pulse entries`);
    }
  }

  // Clean up pulse data when user disconnects
  cleanupPulseData(userId) {
    const keysToRemove = [];

    for (const [pulseKey, pulseInfo] of this.pulseData.entries()) {
      if (pulseInfo.userId === userId) {
        keysToRemove.push(pulseKey);
      }
    }

    keysToRemove.forEach(key => {
      this.pulseData.delete(key);
    });

    if (keysToRemove.length > 0) {
      console.log(`💓 Cleaned up pulse data for user ${userId}: ${keysToRemove.length} entries`);
    }
  }
}

module.exports = new SocketService();
