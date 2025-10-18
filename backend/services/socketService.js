const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/message');
const User = require('../models/user');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId mapping
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:3001',
          'https://jaifriend.hgdjlive.com',
          'https://jaifriend-backend.hgdjlive.com'
        ],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.use(this.authenticateSocket.bind(this));
    this.setupEventHandlers();
    
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
            replyTo: replyTo || null
          });

          const savedMessage = await messageDoc.save();
          
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

          // Broadcast message to conversation participants (including sender)
          this.io.to(`conversation_${conversationId}`).emit('new_message', message);
          
          console.log(`📡 Broadcasting message to conversation_${conversationId}`);

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
        const { callId, candidate, receiverId } = data;
        
        // Forward ICE candidate to receiver
        socket.to(`user_${receiverId}`).emit('webrtc_ice_candidate', {
          callId,
          candidate,
          senderId: socket.userId,
          timestamp: new Date().toISOString()
        });
      });

      // Handle video call events
      socket.on('join-video-call-service', (data) => {
        const { userId, userName } = data;
        console.log(`📹 User ${userName} (${userId}) joined video call service`);
        // Join user to their personal video call room
        socket.join(`video_user_${userId}`);
      });

      socket.on('initiate-video-call', (data) => {
        const { callerId, callerName, receiverId, receiverName, callId } = data;
        console.log(`📹 Video call initiated from ${callerName} to ${receiverName}`);
        
        // Send video call invitation to receiver
        socket.to(`video_user_${receiverId}`).emit('incoming-video-call', {
          callerId,
          callerName,
          receiverId,
          receiverName,
          callId,
          timestamp: new Date().toISOString()
        });
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
        socket.join(roomId);
        console.log(`📹 User ${socket.user.name} joined video call room ${roomId}`, data || '');
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
        
        // Check room members before forwarding
        const room = this.io.sockets.adapter.rooms.get(roomId);
        console.log(`🔍 DEBUG: Room ${roomId} members:`, room ? Array.from(room) : 'Room not found');
        
        // Forward offer to other participants in the room
        socket.to(roomId).emit('offer', offer);
        console.log(`🔍 DEBUG: offer forwarded to room ${roomId}`);
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
        // Forward answer to other participants in the room
        socket.to(roomId).emit('answer', answer);
        console.log(`🔍 DEBUG: answer forwarded to room ${roomId}`);
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
        // Forward ICE candidate to other participants in the room
        socket.to(roomId).emit('ice-candidate', candidate);
        console.log(`🔍 DEBUG: ice-candidate forwarded to room ${roomId}`);
      });

      socket.on('user-disconnected', (roomId) => {
        console.log(`📹 User ${socket.user.name} disconnected from room ${roomId}`);
        // Notify other participants that user disconnected
        socket.to(roomId).emit('user-disconnected');
      });

      // Handle user disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.user.name} (${socket.userId})`);
        
        // Remove user from connected users
        this.connectedUsers.delete(socket.userId);
        
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
      // Get conversation participants (you might need to implement this based on your conversation model)
      // For now, we'll send to all users except the sender
      
      this.io.emit('message_notification', {
        conversationId,
        message: {
          content: message.content,
          sender: message.sender,
          timestamp: message.timestamp
        },
        senderId
      });
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
}

module.exports = new SocketService();
