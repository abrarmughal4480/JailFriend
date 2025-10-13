import { io, Socket } from 'socket.io-client';
import { getToken } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://jailfriend-1.onrender.com');

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (this.socket?.connected) {
      console.log('🔌 Socket already connected');
      return;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const token = getToken();
    if (!token) {
      console.error('❌ No token found for socket connection');
      return;
    }

    console.log('🔌 Connecting to socket server...', {
      url: API_URL,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + '...'
    });

    this.socket = io(API_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.isConnected = false;
      this.handleReconnect();
    });

    this.socket.on('new_message', (message) => {
      console.log('💬 New message received:', message);
      // Emit custom event for components to listen
      window.dispatchEvent(new CustomEvent('socket_new_message', { detail: message }));
    });

    this.socket.on('message_notification', (notification) => {
      console.log('🔔 Message notification:', notification);
      window.dispatchEvent(new CustomEvent('socket_message_notification', { detail: notification }));
    });

    this.socket.on('user_typing', (data) => {
      console.log('⌨️ User typing:', data);
      window.dispatchEvent(new CustomEvent('socket_user_typing', { detail: data }));
    });

    this.socket.on('user_stopped_typing', (data) => {
      console.log('⌨️ User stopped typing:', data);
      window.dispatchEvent(new CustomEvent('socket_user_stopped_typing', { detail: data }));
    });

    this.socket.on('message_read', (data) => {
      console.log('👁️ Message read:', data);
      window.dispatchEvent(new CustomEvent('socket_message_read', { detail: data }));
    });

    this.socket.on('user_status_change', (data) => {
      console.log('🟢 User status change:', data);
      window.dispatchEvent(new CustomEvent('socket_user_status_change', { detail: data }));
    });

    this.socket.on('message_error', (error) => {
      console.error('❌ Message error:', error);
      window.dispatchEvent(new CustomEvent('socket_message_error', { detail: error }));
    });

    // Audio call events
    this.socket.on('incoming_call', (callData) => {
      console.log('📞 Incoming call:', callData);
      window.dispatchEvent(new CustomEvent('socket_incoming_call', { detail: callData }));
    });

    this.socket.on('call_accepted', (callData) => {
      console.log('📞 Call accepted:', callData);
      window.dispatchEvent(new CustomEvent('socket_call_accepted', { detail: callData }));
    });

    this.socket.on('call_rejected', (callData) => {
      console.log('📞 Call rejected:', callData);
      window.dispatchEvent(new CustomEvent('socket_call_rejected', { detail: callData }));
    });

    this.socket.on('call_ended', (callData) => {
      console.log('📞 Call ended:', callData);
      window.dispatchEvent(new CustomEvent('socket_call_ended', { detail: callData }));
    });

    this.socket.on('call_cancelled', (callData) => {
      console.log('📞 Call cancelled:', callData);
      window.dispatchEvent(new CustomEvent('socket_call_cancelled', { detail: callData }));
    });

    // WebRTC signaling events
    this.socket.on('webrtc_offer', (data) => {
      console.log('📞 WebRTC offer received:', data);
      window.dispatchEvent(new CustomEvent('socket_webrtc_offer', { detail: data }));
    });

    this.socket.on('webrtc_answer', (data) => {
      console.log('📞 WebRTC answer received:', data);
      window.dispatchEvent(new CustomEvent('socket_webrtc_answer', { detail: data }));
    });

    this.socket.on('webrtc_ice_candidate', (data) => {
      console.log('📞 WebRTC ICE candidate received:', data);
      window.dispatchEvent(new CustomEvent('socket_webrtc_ice_candidate', { detail: data }));
    });

    this.socket.on('call_quality_update', (data) => {
      console.log('📞 Call quality update:', data);
      window.dispatchEvent(new CustomEvent('socket_call_quality_update', { detail: data }));
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, 2000 * this.reconnectAttempts); // Exponential backoff
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  // Join a conversation room
  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      console.log('👥 Joining conversation:', conversationId);
      this.socket.emit('join_conversation', conversationId);
    } else {
      console.warn('⚠️ Socket not connected, cannot join conversation');
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      console.log('👥 Leaving conversation:', conversationId);
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  // Send a message
  sendMessage(conversationId: string, content: string, type: string = 'text', replyTo?: any, media?: string) {
    if (this.socket?.connected) {
      console.log('💬 Sending message via socket:', { conversationId, content, type });
      this.socket.emit('send_message', {
        conversationId,
        content,
        type,
        replyTo,
        media
      });
    } else {
      console.warn('⚠️ Socket not connected, cannot send message');
      throw new Error('Socket not connected');
    }
  }

  // Start typing indicator
  startTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  // Stop typing indicator
  stopTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  // Mark message as read
  markMessageRead(conversationId: string, messageId: string) {
    if (this.socket?.connected) {
      this.socket.emit('mark_message_read', { conversationId, messageId });
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check if socket is connected
  getConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
