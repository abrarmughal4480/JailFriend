"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Info, 
  Send, 
  Paperclip, 
  Smile, 
  Image as ImageIcon,
  FileText,
  Mic,
  Check,
  Clock,
  ArrowLeft,
  Filter,
  Archive,
  Trash2,
  Shield,
  AlertTriangle,
  Star,
  StarOff,
  X,
  MessageCircle,
  History
} from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { getToken, getCurrentUserId } from '@/utils/auth';
import socketService from '@/services/socketService';
import AudioCallInterface from '@/components/AudioCallInterface';
import CallHistory from '@/components/CallHistory';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://jaifriend-backend.hgdjlive.com');

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'file' | 'voice';
  media?: string;
  replyTo?: {
    _id: string;
    content: string;
    sender: {
      name: string;
    };
  };
  status?: 'sent' | 'delivered' | 'read';
  receiverOnline?: boolean;
}

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    username: string;
    avatar?: string;
    isOnline?: boolean;
  }>;
  lastMessage: Message;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  updatedAt: string;
}

interface FollowedUser {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  bio?: string;
}

interface FollowerUser {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  bio?: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [allMessages, setAllMessages] = useState<{[conversationId: string]: Message[]}>({});
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showConversationMenu, setShowConversationMenu] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<FollowedUser[]>([]);
  const [showFollowedUsers, setShowFollowedUsers] = useState(false);
  const [followedUsersLoading, setFollowedUsersLoading] = useState(false);
  const [followerUsers, setFollowerUsers] = useState<FollowerUser[]>([]);
  const [showFollowerUsers, setShowFollowerUsers] = useState(false);
  const [followerUsersLoading, setFollowerUsersLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // Audio call states
  const [showCallInterface, setShowCallInterface] = useState(false);
  const [callType, setCallType] = useState<'incoming' | 'outgoing' | 'active'>('incoming');
  const [currentCall, setCurrentCall] = useState<any>(null);
  const [caller, setCaller] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedNotifications = useRef<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const messages = selectedConversation ? (allMessages[selectedConversation._id] || []) : [];
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';

  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return null;
    }
  };

  const getToken = () => localStorage.getItem('token');

  const updateMessageStatus = (conversationId: string, messageId: string, status: 'sent' | 'delivered' | 'read') => {
    setAllMessages(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map((msg: Message) => 
        msg._id === messageId ? { ...msg, status, isRead: status === 'read' } : msg
      )
    }));
  };

  const markMessagesAsRead = async (conversationId: string) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/messages/read/${conversationId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Update local state - mark all messages in this conversation as read
        setAllMessages(prev => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).map((msg: Message) => ({
            ...msg,
            isRead: true
          }))
        }));

        // Update conversation list - clear unread count
        setConversations(prev => prev.map(conv => 
          conv._id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        ));

        console.log('✅ Messages marked as read for conversation:', conversationId);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const fetchConversations = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const { conversations = [] } = await response.json();
        const mappedConversations = conversations.map((conv: any) => {
          const currentUserId = getCurrentUserId();
          const otherUserId = conv.otherUser._id;
          const sortedIds = [currentUserId, otherUserId].sort();
          const conversationId = `${sortedIds[0]}-${sortedIds[1]}`;
          
          return {
            _id: conversationId,
            participants: [{
              _id: conv.otherUser._id,
              name: conv.otherUser.name,
              username: conv.otherUser.username,
              avatar: conv.otherUser.avatar,
              isOnline: conv.otherUser.isOnline
            }],
            lastMessage: {
              _id: conv.lastMessage._id,
              content: conv.lastMessage.content,
              sender: {
                _id: conv.otherUser._id,
                name: conv.otherUser.name,
                username: conv.otherUser.username
              },
              receiver: {
                _id: currentUserId || 'current_user',
                name: 'You',
                username: 'you'
              },
              timestamp: conv.lastMessage.createdAt,
              isRead: conv.lastMessage.isRead,
              type: conv.lastMessage.messageType || 'text'
            },
            unreadCount: conv.unreadCount,
            isPinned: false,
            isArchived: false,
            updatedAt: conv.updatedAt
          };
        });
        setConversations(mappedConversations);
        
        // Load messages for all conversations
        await loadAllMessages(mappedConversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const loadAllMessages = async (conversations: Conversation[]) => {
    const token = getToken();
    if (!token) return;

    setLoadingMessages(true);
    try {
      // Load messages for each conversation
      const messagePromises = conversations.map(async (conversation) => {
        const [userId1, userId2] = conversation._id.split('-');
        
        if (!userId1 || !userId2) {
          console.error('Invalid conversation ID format:', conversation._id);
          return;
        }

        try {
          const response = await fetch(`${API_URL}/api/messages/conversation/${userId1}/${userId2}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const { messages = [] } = await response.json();
            const mappedMessages = messages.map((msg: any) => ({
              _id: msg._id,
              content: msg.content,
              sender: {
                _id: msg.senderId._id,
                name: msg.senderId.name,
                username: msg.senderId.username,
                avatar: msg.senderId.avatar
              },
              receiver: {
                _id: msg.receiverId._id,
                name: msg.receiverId.name,
                username: msg.receiverId.username,
                avatar: msg.receiverId.avatar
              },
              timestamp: msg.createdAt,
              isRead: msg.isRead,
              type: msg.messageType || 'text',
              media: msg.mediaUrl,
              replyTo: msg.replyTo
            }));
            
            return { conversationId: conversation._id, messages: mappedMessages };
          }
        } catch (error) {
          console.error(`Error loading messages for conversation ${conversation._id}:`, error);
        }
      });

      // Wait for all message loading to complete
      const messageResults = await Promise.all(messagePromises);
      
      // Update allMessages state with all loaded messages
      const allMessagesUpdate: {[conversationId: string]: Message[]} = {};
      messageResults.forEach(result => {
        if (result) {
          allMessagesUpdate[result.conversationId] = result.messages;
        }
      });
      
      setAllMessages(prev => ({
        ...prev,
        ...allMessagesUpdate
      }));
      
      console.log('✅ All messages loaded for', Object.keys(allMessagesUpdate).length, 'conversations');
    } catch (error) {
      console.error('Error loading all messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const updateOnlineStatusFromSocket = (userId: string, isOnline: boolean) => {
    setConversations(prev => prev.map(conv => ({
      ...conv,
      participants: conv.participants.map(participant => 
        participant._id === userId ? { ...participant, isOnline } : participant
      )
    })));
  };

  const fetchFollowerUsers = async () => {
    const token = getToken();
    if (!token) return;

    setFollowerUsersLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/followers/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const { followers = [] } = await response.json();
        const mappedUsers = followers.map((user: any) => ({
          _id: user._id || user.id,
          name: user.name || user.fullName || 'Unknown User',
          username: user.username || `@${(user._id || user.id).toString().slice(-8)}`,
          avatar: user.avatar || '/default-avatar.svg',
          isOnline: user.isOnline || false,
          lastSeen: user.lastSeen || '',
          bio: user.bio || ''
        }));
        setFollowerUsers(mappedUsers);
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setFollowerUsersLoading(false);
    }
  };

  const fetchFollowedUsers = async () => {
    const token = getToken();
    if (!token) return;

    setFollowedUsersLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/following/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const { following = [] } = await response.json();
        const mappedUsers = following.map((user: any) => ({
          _id: user._id || user.id,
          name: user.name || user.fullName || 'Unknown User',
          username: user.username || `@${(user._id || user.id).toString().slice(-8)}`,
          avatar: user.avatar || '/default-avatar.svg',
          isOnline: user.isOnline || false,
          lastSeen: user.lastSeen || '',
          bio: user.bio || ''
        }));
        setFollowedUsers(mappedUsers);
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setFollowedUsersLoading(false);
    }
  };

  // Start conversation with followed user
  const startConversation = (user: FollowedUser | FollowerUser) => {
    const currentUserId = getCurrentUserId();
    const sortedIds = [currentUserId, user._id].sort();
    const conversationId = `${sortedIds[0]}-${sortedIds[1]}`;
    
    const newConversation: Conversation = {
      _id: conversationId,
      participants: [{
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        isOnline: user.isOnline
      }],
      lastMessage: {
        _id: 'temp',
        content: 'Conversation started',
          sender: {
          _id: currentUserId || 'temp',
          name: 'System',
          username: 'system'
          },
          receiver: {
          _id: user._id,
          name: user.name,
          username: user.username
        },
        timestamp: new Date().toISOString(),
          isRead: true,
          type: 'text'
        },
      unreadCount: 0,
      isPinned: false,
      isArchived: false,
      updatedAt: new Date().toISOString()
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversation(newConversation);
    setShowFollowedUsers(false);
    setShowFollowerUsers(false);
    
    // Join conversation room
    socketService.joinConversation(newConversation._id);
  };

  const loadMessages = async (conversationId: string) => {
    // Check if messages are already loaded
    if (allMessages[conversationId] && allMessages[conversationId].length > 0) {
      console.log('📱 Messages already loaded for conversation:', conversationId);
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      // Parse conversation ID to get the two user IDs
      const [userId1, userId2] = conversationId.split('-');
      
      // Validate conversation ID format
      if (!userId1 || !userId2) {
        console.error('Invalid conversation ID format:', conversationId);
        return;
      }

      const response = await fetch(`${API_URL}/api/messages/conversation/${userId1}/${userId2}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const { messages = [] } = await response.json();
        const mappedMessages = messages.map((msg: any) => ({
          _id: msg._id,
          content: msg.content,
          sender: {
            _id: msg.senderId._id,
            name: msg.senderId.name,
            username: msg.senderId.username,
            avatar: msg.senderId.avatar
          },
          receiver: {
            _id: msg.receiverId._id,
            name: msg.receiverId.name,
            username: msg.receiverId.username,
            avatar: msg.receiverId.avatar
          },
          timestamp: msg.createdAt,
          isRead: msg.isRead,
          type: msg.messageType || 'text',
          media: msg.mediaUrl,
          replyTo: msg.replyTo
        }));
        
        setAllMessages(prev => ({
          ...prev,
          [conversationId]: mappedMessages
        }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const currentUserId = getCurrentUserId();
      const receiver = selectedConversation.participants[0];
      const isReceiverOnline = receiver.isOnline || false;
      
      const message: Message = {
        _id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: newMessage.trim(),
        sender: {
          _id: currentUserId || 'current_user',
          name: 'You',
          username: 'you'
        },
        receiver: {
          _id: receiver._id,
          name: receiver.name,
          username: receiver.username
        },
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'text',
        replyTo: replyingTo || undefined,
        status: 'delivered',
        receiverOnline: true
      };

      socketService.sendMessage(
        selectedConversation._id,
        message.content,
        message.type,
        replyingTo
      );

      setAllMessages(prev => {
        const conversationId = selectedConversation._id;
        const currentMessages = prev[conversationId] || [];
        const exists = currentMessages.some(msg => msg._id === message._id);
        if (!exists) {
          return {
            ...prev,
            [conversationId]: [...currentMessages, message]
          };
        }
        return prev;
      });
      
      setConversations(prev => {
        const existingConv = prev.find(conv => conv._id === selectedConversation._id);
        if (existingConv) {
          console.log('📤 Sending message - Clearing unread count for conversation:', {
            conversationId: selectedConversation._id,
            previousUnreadCount: existingConv.unreadCount,
            newUnreadCount: 0
          });
          return prev.map(conv => 
            conv._id === selectedConversation._id 
              ? {
                  ...conv,
                  lastMessage: message,
                  unreadCount: 0,
                  updatedAt: message.timestamp
                }
              : conv
          );
        } else {
          const newConversation: Conversation = {
            _id: selectedConversation._id,
            participants: selectedConversation.participants,
            lastMessage: message,
            unreadCount: 0,
            isPinned: false,
            isArchived: false,
            updatedAt: message.timestamp
          };
          return [newConversation, ...prev];
        }
      });

      setNewMessage('');
      setReplyingTo(null);
      socketService.stopTyping(selectedConversation._id);

    } catch (error) {
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchFollowedUsers();
    fetchFollowerUsers();
    fetchConversations();
    
    if (!socketService.getConnected()) {
      socketService.connect();
    }

    const updateMyOnlineStatus = async () => {
      try {
        const token = getToken();
        if (!token) return;

        await fetch(`${API_URL}/api/profile/online-status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isOnline: true })
        });
      } catch (error) {
      }
    };

    updateMyOnlineStatus();
    const handleNewMessage = (event: CustomEvent) => {
      const message = event.detail;
      const currentUserId = getCurrentUserId();
      
      updateOnlineStatusFromSocket(message.sender._id, true);
      
      setAllMessages(prev => {
        const conversationId = message.conversationId;
        const currentMessages = prev[conversationId] || [];
        const exists = currentMessages.some(msg => msg._id === message._id);
        if (!exists) {
          const messageWithStatus = {
            ...message,
            status: message.isRead ? 'read' : 'delivered',
            receiverOnline: true
          };
          return {
            ...prev,
            [conversationId]: [...currentMessages, messageWithStatus]
          };
        }
        return prev;
      });
      
      setConversations(prev => {
        const existingConv = prev.find(conv => conv._id === message.conversationId);
        if (existingConv) {
          return prev.map(conv => {
            if (conv._id === message.conversationId) {
              return {
                ...conv,
                lastMessage: message,
                unreadCount: conv.unreadCount + (message.sender._id !== currentUserId ? 1 : 0),
                updatedAt: message.timestamp
              };
            }
            return conv;
          });
        } else {
          const newConversation: Conversation = {
            _id: message.conversationId,
            participants: [{
              _id: message.sender._id,
              name: message.sender.name,
              username: message.sender.username,
              avatar: message.sender.avatar,
              isOnline: false
            }],
            lastMessage: message,
            unreadCount: message.sender._id !== currentUserId ? 1 : 0,
            isPinned: false,
            isArchived: false,
            updatedAt: message.timestamp
          };
          return [newConversation, ...prev];
        }
      });
    };

    const handleUserTyping = (event: CustomEvent) => {
      const data = event.detail;
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setTypingUsers(prev => {
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId];
          }
          return prev;
        });
        setIsTyping(true);
      }
    };

    const handleUserStoppedTyping = (event: CustomEvent) => {
      const data = event.detail;
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
        setIsTyping(typingUsers.length > 1);
      }
    };

    const handleMessageRead = (event: CustomEvent) => {
      const data = event.detail;
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        updateMessageStatus(data.conversationId, data.messageId, 'read');
      }
    };

    const handleUserStatusChange = (event: CustomEvent) => {
      const data = event.detail;
      
      setConversations(prev => prev.map(conv => ({
        ...conv,
        participants: conv.participants.map(participant => 
          participant._id === data.userId 
            ? { ...participant, isOnline: data.isOnline }
            : participant
        )
      })));

      if (data.isOnline && selectedConversation) {
        const otherParticipant = selectedConversation.participants.find(p => p._id === data.userId);
        if (otherParticipant) {
          setAllMessages(prev => ({
            ...prev,
            [selectedConversation._id]: (prev[selectedConversation._id] || []).map((msg: Message) => 
              msg.sender._id === getCurrentUserId() && !msg.isRead 
                ? { ...msg, receiverOnline: true, status: 'delivered' }
                : msg
            )
          }));
        }
      }
    };

    const handleMessageNotification = (event: CustomEvent) => {
      const notification = event.detail;
      const currentUserId = getCurrentUserId();
      
      updateOnlineStatusFromSocket(notification.senderId, true);
      
      const messageId = notification.message._id || notification.message.id || `msg_${Date.now()}`;
      const notificationId = `${notification.conversationId}_${messageId}_${currentUserId}`;
      
      if (processedNotifications.current.has(notificationId)) {
        return;
      }
      
      if (notification.senderId === currentUserId) {
        return;
      }
      
      processedNotifications.current.add(notificationId);
      
      if (processedNotifications.current.size > 100) {
        const notificationsArray = Array.from(processedNotifications.current);
        processedNotifications.current.clear();
        notificationsArray.slice(-50).forEach(id => processedNotifications.current.add(id));
      }
      
      const message = {
        _id: messageId,
        content: notification.message.content,
        sender: notification.message.sender,
        receiver: {
          _id: currentUserId || 'current_user',
          name: 'You',
          username: 'you'
        },
        timestamp: notification.message.timestamp,
        isRead: false,
        type: notification.message.type || 'text',
        conversationId: notification.conversationId
      };
      
      setAllMessages(prev => {
        const conversationId = notification.conversationId;
        const currentMessages = prev[conversationId] || [];
        const exists = currentMessages.some(msg => 
          msg._id === message._id || 
          (msg.content === message.content && 
           msg.sender._id === message.sender._id && 
           Math.abs(new Date(msg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 1000)
        );
        if (!exists) {
          const messageWithStatus = {
            ...message,
            status: message.isRead ? 'read' : 'delivered',
            receiverOnline: true
          };
          return {
            ...prev,
            [conversationId]: [...currentMessages, messageWithStatus]
          };
        }
        return prev;
      });
      
      setConversations(prev => {
        const existingConv = prev.find(conv => conv._id === notification.conversationId);
        if (existingConv) {
          return prev.map(conv => {
            if (conv._id === notification.conversationId) {
              return {
                ...conv,
                lastMessage: message,
                unreadCount: conv.unreadCount + (notification.senderId !== currentUserId ? 1 : 0),
                updatedAt: message.timestamp
              };
            }
            return conv;
          });
        } else {
          const newConversation: Conversation = {
            _id: notification.conversationId,
            participants: [{
              _id: notification.message.sender._id,
              name: notification.message.sender.name,
              username: notification.message.sender.username,
              avatar: notification.message.sender.avatar,
              isOnline: false
            }],
            lastMessage: message,
            unreadCount: notification.senderId !== currentUserId ? 1 : 0,
            isPinned: false,
            isArchived: false,
            updatedAt: message.timestamp
          };
          return [newConversation, ...prev];
        }
      });
    };

    // Audio call socket event handlers
    const handleIncomingCall = (event: CustomEvent) => {
      const callData = event.detail;
      setCaller(callData.caller);
      setCallType('incoming');
      setShowCallInterface(true);
      
      // Use the actual call ID from the database
      setCurrentCall({
        _id: callData.callId,
        callerId: callData.caller,
        receiverId: { _id: getCurrentUserId() }
      });
    };

    const handleCallAccepted = (event: CustomEvent) => {
      const callData = event.detail;
      console.log('📞 Call accepted event received:', callData);
      console.log('📞 Current call state:', {
        currentCall: currentCall,
        currentCallId: currentCall?._id,
        eventCallId: callData.callId,
        callType: callType
      });
      
      // Check if we have a current call and the IDs match
      if (currentCall && currentCall._id === callData.callId) {
        console.log('✅ Call accepted - switching to active mode');
        setCallType('active');
        // Start WebRTC connection for the caller
        startWebRTCConnection();
      } else if (!currentCall && (callType === 'outgoing' || callType === 'active' || callType === 'incoming')) {
        // Fallback: if we don't have currentCall but are in any call mode, 
        // create a call object from event data and ensure we're in active mode
        console.log('📞 Fallback: Creating call object from event data');
        const callObject = {
          _id: callData.callId,
          callerId: { _id: getCurrentUserId() },
          receiverId: { _id: callData.receiverId }
        };
        setCurrentCall(callObject);
        setCallType('active');
        startWebRTCConnection(callObject);
      } else {
        console.log('❌ Call ID mismatch or no current call:', {
          currentCallId: currentCall?._id,
          eventCallId: callData.callId,
          hasCurrentCall: !!currentCall,
          callType: callType
        });
      }
    };

    const handleCallRejected = (event: CustomEvent) => {
      const callData = event.detail;
      if (currentCall && currentCall._id === callData.callId) {
        setShowCallInterface(false);
        setCurrentCall(null);
        setCaller(null);
      }
    };

    const handleCallEnded = (event: CustomEvent) => {
      const callData = event.detail;
      if (currentCall && currentCall._id === callData.callId) {
        cleanupWebRTCConnection();
        setShowCallInterface(false);
        setCurrentCall(null);
        setCaller(null);
      }
    };

    const handleCallCancelled = (event: CustomEvent) => {
      const callData = event.detail;
      if (currentCall && currentCall._id === callData.callId) {
        setShowCallInterface(false);
        setCurrentCall(null);
        setCaller(null);
      }
    };

    // WebRTC signaling handlers
    const handleWebRTCOffer = (event: CustomEvent) => {
      const { callId, offer, senderId } = event.detail;
      if (currentCall && currentCall._id === callId && peerConnection) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        peerConnection.createAnswer().then(answer => {
          peerConnection.setLocalDescription(answer);
          socketService.getSocket()?.emit('webrtc_answer', {
            callId,
            answer,
            callerId: senderId
          });
        });
      }
    };

    const handleWebRTCAnswer = (event: CustomEvent) => {
      const { callId, answer } = event.detail;
      if (currentCall && currentCall._id === callId && peerConnection) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleWebRTCIceCandidate = (event: CustomEvent) => {
      const { callId, candidate } = event.detail;
      if (currentCall && currentCall._id === callId && peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    window.addEventListener('socket_new_message', handleNewMessage as EventListener);
    window.addEventListener('socket_user_typing', handleUserTyping as EventListener);
    window.addEventListener('socket_user_stopped_typing', handleUserStoppedTyping as EventListener);
    window.addEventListener('socket_message_read', handleMessageRead as EventListener);
    window.addEventListener('socket_user_status_change', handleUserStatusChange as EventListener);
    window.addEventListener('socket_message_notification', handleMessageNotification as EventListener);
    
    // Audio call socket events
    window.addEventListener('socket_incoming_call', handleIncomingCall as EventListener);
    window.addEventListener('socket_call_accepted', handleCallAccepted as EventListener);
    window.addEventListener('socket_call_rejected', handleCallRejected as EventListener);
    window.addEventListener('socket_call_ended', handleCallEnded as EventListener);
    window.addEventListener('socket_call_cancelled', handleCallCancelled as EventListener);
    window.addEventListener('socket_webrtc_offer', handleWebRTCOffer as EventListener);
    window.addEventListener('socket_webrtc_answer', handleWebRTCAnswer as EventListener);
    window.addEventListener('socket_webrtc_ice_candidate', handleWebRTCIceCandidate as EventListener);

    return () => {
      window.removeEventListener('socket_new_message', handleNewMessage as EventListener);
      window.removeEventListener('socket_user_typing', handleUserTyping as EventListener);
      window.removeEventListener('socket_user_stopped_typing', handleUserStoppedTyping as EventListener);
      window.removeEventListener('socket_message_read', handleMessageRead as EventListener);
      window.removeEventListener('socket_user_status_change', handleUserStatusChange as EventListener);
      window.removeEventListener('socket_message_notification', handleMessageNotification as EventListener);
      
      // Audio call socket events cleanup
      window.removeEventListener('socket_incoming_call', handleIncomingCall as EventListener);
      window.removeEventListener('socket_call_accepted', handleCallAccepted as EventListener);
      window.removeEventListener('socket_call_rejected', handleCallRejected as EventListener);
      window.removeEventListener('socket_call_ended', handleCallEnded as EventListener);
      window.removeEventListener('socket_call_cancelled', handleCallCancelled as EventListener);
      window.removeEventListener('socket_webrtc_offer', handleWebRTCOffer as EventListener);
      window.removeEventListener('socket_webrtc_answer', handleWebRTCAnswer as EventListener);
      window.removeEventListener('socket_webrtc_ice_candidate', handleWebRTCIceCandidate as EventListener);
      
      const setOfflineStatus = async () => {
        try {
          const token = getToken();
          if (!token) return;

          await fetch(`${API_URL}/api/profile/online-status`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isOnline: false })
          });
        } catch (error) {
        }
      };

      setOfflineStatus();
      socketService.disconnect();
    };
  }, [selectedConversation, typingUsers]);

  useEffect(() => {
    setLoading(false);
  }, []);
   
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
      
      console.log('👁️ Opening conversation - Clearing unread count:', {
        conversationId: selectedConversation._id,
        previousUnreadCount: selectedConversation.unreadCount
      });
      
      // Mark messages as read in the database and update local state
      if (selectedConversation.unreadCount > 0) {
        markMessagesAsRead(selectedConversation._id);
      } else {
        // Just update local state if no unread messages
        setConversations(prev => prev.map(conv => 
          conv._id === selectedConversation._id 
            ? { ...conv, unreadCount: 0 }
            : conv
        ));
      }
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      const conversationId = selectedConversation._id;
      const conversationMessages = allMessages[conversationId] || [];
      
      conversationMessages.forEach((message: Message) => {
        const currentUserId = getCurrentUserId();
        if (message.sender._id === currentUserId && message.status === 'sent') {
          const otherParticipant = selectedConversation.participants.find(p => p._id !== currentUserId);
          if (otherParticipant?.isOnline) {
            setTimeout(() => {
              updateMessageStatus(conversationId, message._id, 'delivered');
            }, 1000);
          }
        }
      });
    }
  }, [selectedConversation, allMessages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60 * 1000) return 'Just now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h`;
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d`;
    
    return date.toLocaleDateString();
  };

  const getOtherParticipant = (conversation: Conversation) => {
    const currentUserId = getCurrentUserId();
    return conversation.participants.find(p => p._id !== currentUserId) || conversation.participants[0];
  };

  // Audio Call Functions
  const initiateCall = async (receiverId: string) => {
    const token = getToken();
    if (!token) {
      console.error('❌ No token found for call initiation');
      return;
    }

    // Check microphone permission first
    try {
      console.log('🎤 Checking microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop());
      console.log('✅ Microphone permission granted');
    } catch (error: any) {
      console.error('❌ Microphone permission denied:', error);
      if (error.name === 'NotAllowedError') {
        alert('Microphone access is required for audio calls. Please allow microphone access and try again.');
      } else if (error.name === 'NotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.');
      } else {
        alert('Unable to access microphone. Please check your microphone settings and try again.');
      }
      return;
    }

    console.log('📞 Initiating call with:', {
      receiverId,
      token: token.substring(0, 20) + '...',
      API_URL
    });

    try {
      const response = await fetch(`${API_URL}/api/audio-calls/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiverId, callType: 'audio' })
      });

      console.log('📞 Call initiation response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentCall(data.call);
        setCallType('outgoing');
        setShowCallInterface(true);
        
        // Emit socket event for call initiation with actual call ID
        socketService.getSocket()?.emit('initiate_call', {
          receiverId,
          callType: 'audio',
          callId: data.call._id
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Call initiation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        // Show user-friendly error message
        if (errorData.message) {
          alert(`Call failed: ${errorData.message}`);
        } else {
          alert('Failed to initiate call. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Error initiating call:', error);
    }
  };

  const acceptCall = async () => {
    if (!currentCall) return;

    // Check microphone permission first
    try {
      console.log('🎤 Checking microphone permission for call...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop());
      console.log('✅ Microphone permission granted');
    } catch (error: any) {
      console.error('❌ Microphone permission denied:', error);
      if (error.name === 'NotAllowedError') {
        alert('Microphone access is required for audio calls. Please allow microphone access and try again.');
      } else if (error.name === 'NotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.');
      } else {
        alert('Unable to access microphone. Please check your microphone settings and try again.');
      }
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/audio-calls/${currentCall._id}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setCallType('active');
        
        // Emit socket event for call acceptance
        socketService.getSocket()?.emit('accept_call', {
          callId: currentCall._id,
          callerId: currentCall.callerId._id
        });

        // Start WebRTC connection
        await startWebRTCConnection();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Call acceptance failed:', errorData);
        alert('Failed to accept call. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      alert('Failed to accept call. Please try again.');
    }
  };

  const rejectCall = async () => {
    if (!currentCall) return;

    // If call is active, end it instead of rejecting
    if (callType === 'active') {
      console.log('📞 Call is active, ending instead of rejecting');
      await endCall();
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/audio-calls/${currentCall._id}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Emit socket event for call rejection
        socketService.getSocket()?.emit('reject_call', {
          callId: currentCall._id,
          callerId: currentCall.callerId._id,
          reason: 'user_rejected'
        });

        // Close call interface
        setShowCallInterface(false);
        setCurrentCall(null);
        setCaller(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Call rejection failed:', errorData);
        
        // If rejection fails because call is already answered, end it instead
        if (errorData.message && errorData.message.includes('current status')) {
          console.log('📞 Call already answered, ending instead');
          await endCall();
        } else {
          alert('Failed to reject call. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error rejecting call:', error);
      alert('Failed to reject call. Please try again.');
    }
  };

  const endCall = async () => {
    if (!currentCall) return;

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/audio-calls/${currentCall._id}/end`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Emit socket event for call end
        const otherUserId = currentCall.callerId._id === getCurrentUserId() 
          ? currentCall.receiverId._id 
          : currentCall.callerId._id;
        
        socketService.getSocket()?.emit('end_call', {
          callId: currentCall._id,
          otherUserId
        });

        // Clean up WebRTC connection
        await cleanupWebRTCConnection();
        
        // Close call interface
        setShowCallInterface(false);
        setCurrentCall(null);
        setCaller(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Call end failed:', errorData);
        alert('Failed to end call. Please try again.');
      }
    } catch (error) {
      console.error('Error ending call:', error);
      alert('Failed to end call. Please try again.');
    }
  };

  const cancelCall = async () => {
    if (!currentCall) return;

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/audio-calls/${currentCall._id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Emit socket event for call cancellation
        socketService.getSocket()?.emit('cancel_call', {
          callId: currentCall._id,
          receiverId: currentCall.receiverId._id
        });

        // Close call interface
        setShowCallInterface(false);
        setCurrentCall(null);
        setCaller(null);
      }
    } catch (error) {
      console.error('Error cancelling call:', error);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = isSpeakerOn;
    }
  };

  const startWebRTCConnection = async (callData?: any) => {
    try {
      console.log('🎤 Requesting microphone access...');
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      // Get user media with better error handling
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('✅ Microphone access granted');
      setLocalStream(stream);
      
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setRemoteStream(remoteStream);
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
      };

      // Use passed call data or current call
      const activeCall = callData || currentCall;
      console.log('📞 WebRTC - Call data:', {
        callData: callData,
        currentCall: currentCall,
        activeCall: activeCall
      });
      
      // Check if we have a valid call
      if (!activeCall) {
        console.error('❌ No active call data available for WebRTC');
        return;
      }
      
      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && activeCall) {
          const otherUserId = activeCall.callerId._id === getCurrentUserId() 
            ? activeCall.receiverId._id 
            : activeCall.callerId._id;
          
          socketService.getSocket()?.emit('webrtc_ice_candidate', {
            callId: activeCall._id,
            candidate: event.candidate,
            receiverId: otherUserId
          });
        }
      };

      setPeerConnection(pc);

      // Create and send offer if caller
      if (activeCall && activeCall.callerId._id === getCurrentUserId()) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        const otherUserId = activeCall.receiverId._id;
        socketService.getSocket()?.emit('webrtc_offer', {
          callId: activeCall._id,
          offer: offer,
          receiverId: otherUserId
        });
      }

    } catch (error: any) {
      console.error('❌ Error starting WebRTC connection:', error);
      
      // Handle specific error types
      if (error.name === 'NotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotAllowedError') {
        alert('Microphone access denied. Please allow microphone access and try again.');
      } else if (error.name === 'NotReadableError') {
        alert('Microphone is being used by another application. Please close other applications and try again.');
      } else {
        alert(`Audio call error: ${error.message}`);
      }
      
      // Close the call interface on error
      setShowCallInterface(false);
      setCurrentCall(null);
      setCaller(null);
    }
  };

  const cleanupWebRTCConnection = async () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    
    if (localAudioRef.current) {
      localAudioRef.current.srcObject = null;
    }
    
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv);
    return otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherParticipant.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {loadingMessages ? 'Loading all messages...' : 'Loading conversations...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar - Contacts List */}
      <div className={`w-full max-w-md border-r transition-all duration-300 ease-in-out flex flex-col ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
      
        <div className={`p-4 border-b transition-colors duration-200 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className={`p-2 rounded-lg transition-colors duration-200 hover:scale-105 active:scale-95 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className={`text-xl font-semibold transition-colors duration-200 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Messages
              </h1>
              <div className="lg:hidden text-sm text-gray-500 dark:text-gray-400">
                {conversations.length} conversations
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowFollowedUsers(true);
                  setShowFollowerUsers(false);
                }}
                className={`px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 ${
                  showFollowedUsers ? 'bg-blue-600' : ''
                }`}
              >
                New Message
              </button>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          
          {showSearch && (
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white placeholder-gray-400' 
                    : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          )}
          
          {/* Followed Users List */}
          {(showFollowedUsers || showFollowerUsers) && (
            <div className="mt-4">
              {/* Tabs */}
              <div className="flex mb-3 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowFollowedUsers(true);
                    setShowFollowerUsers(false);
                  }}
                  className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    showFollowedUsers
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Following ({followedUsers.length})
                </button>
                <button
                  onClick={() => {
                    setShowFollowerUsers(true);
                    setShowFollowedUsers(false);
                  }}
                  className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    showFollowerUsers
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Followers ({followerUsers.length})
                </button>
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {showFollowedUsers ? 'Start New Conversation' : 'Your Followers'}
                </h3>
                <button
                  onClick={() => {
                    setShowFollowedUsers(false);
                    setShowFollowerUsers(false);
                  }}
                  className={`p-1 rounded-lg transition-colors duration-200 ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-400' 
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {followedUsersLoading || followerUsersLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Loading...
                  </span>
                </div>
              ) : showFollowedUsers && followedUsers.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {followedUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => startConversation(user)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                        isDarkMode 
                          ? 'hover:bg-gray-700' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          {user.avatar && user.avatar !== '/default-avatar.svg' ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">👤</span>
                          )}
                        </div>
                        {user.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm truncate ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {user.name}
                        </div>
                        <div className={`text-xs truncate ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          @{user.username}
                        </div>
                        {user.bio && (
                          <div className={`text-xs truncate mt-1 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {user.bio}
                          </div>
                        )}
                      </div>
                      <MessageCircle className={`w-4 h-4 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                    </div>
                  ))}
                </div>
              ) : showFollowerUsers && followerUsers.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {followerUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => startConversation(user)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                        isDarkMode 
                          ? 'hover:bg-gray-700' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          {user.avatar && user.avatar !== '/default-avatar.svg' ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">👤</span>
                          )}
                        </div>
                        {user.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm truncate ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {user.name}
                        </div>
                        <div className={`text-xs truncate ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          @{user.username}
                        </div>
                        {user.bio && (
                          <div className={`text-xs truncate mt-1 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {user.bio}
                          </div>
                        )}
                      </div>
                      <MessageCircle className={`w-4 h-4 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <MessageCircle className={`w-8 h-8 mx-auto mb-2 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {showFollowedUsers ? 'No followed users found' : 'No followers found'}
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {showFollowedUsers ? 'Follow some users to start conversations' : 'You don\'t have any followers yet'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

     
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
          {filteredConversations.length > 0 ? (
            <div className="py-1">
              {filteredConversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const isSelected = selectedConversation?._id === conversation._id;
                
                return (
                  <div
                    key={conversation._id}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      socketService.joinConversation(conversation._id);
                      
                      // Mark messages as read when opening conversation
                      if (conversation.unreadCount > 0) {
                        markMessagesAsRead(conversation._id);
                      }
                      
                      setTimeout(() => {
                        const chatSection = document.querySelector('[data-chat-section]');
                        if (chatSection) {
                          chatSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                    className={`py-3 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] min-h-[80px] flex items-center mb-2 w-full ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-blue-900/30 border border-blue-700 shadow-lg'
                          : 'bg-blue-50 border border-blue-200 shadow-lg'
                        : isDarkMode
                          ? 'hover:bg-gray-700 hover:shadow-md'
                          : 'hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4 px-4 w-full">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0 w-12 h-12">
                        <img
                          src={otherParticipant.avatar || '/default-avatar.svg'}
                          alt={otherParticipant.name}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/default-avatar.svg';
                          }}
                        />
                        {otherParticipant.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
                      </div>

                    
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-start justify-between mb-2 w-full">
                          <h3 className={`font-medium transition-colors duration-200 text-sm sm:text-base flex-1 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {otherParticipant.name}
                          </h3>
                          <span className={`text-xs sm:text-sm transition-colors duration-200 flex-shrink-0 ml-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {formatTime(conversation.updatedAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between w-full">
                          <p className={`text-xs sm:text-sm transition-colors duration-200 flex-1 ${
                            conversation.unreadCount > 0
                              ? isDarkMode
                                ? 'text-white font-medium'
                                : 'text-gray-900 font-medium'
                              : isDarkMode
                                ? 'text-gray-300'
                                : 'text-gray-600'
                          }`}>
                            {conversation.lastMessage.content}
                          </p>
                          
                          {conversation.unreadCount > 0 && (
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ml-2 flex-shrink-0 ${
                              isDarkMode ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
                            }`}>
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <MessageCircle className={`w-8 h-8 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              <h3 className={`text-lg font-medium mb-2 transition-colors duration-200 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </h3>
              <p className={`text-sm transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {searchQuery 
                  ? 'Try searching with different keywords' 
                  : 'Start a conversation with someone you follow'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowFollowedUsers(true)}
                  className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Start New Conversation
                </button>
              )}
            </div>
          )}
        </div>
      </div>

    
      {/* Chat Section */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col h-screen lg:block" data-chat-section>
          {/* Chat Header */}
          <div className={`p-4 border-b transition-colors duration-200 flex-shrink-0 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedConversation(null);
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                  className="lg:hidden p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="relative w-10 h-10 flex-shrink-0">
                  <img
                    src={getOtherParticipant(selectedConversation).avatar || '/default-avatar.svg'}
                    alt={getOtherParticipant(selectedConversation).name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/default-avatar.svg';
                    }}
                  />
                  {getOtherParticipant(selectedConversation).isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div>
                  <h2 className={`font-semibold transition-colors duration-200 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {getOtherParticipant(selectedConversation).name}
                  </h2>
                  <p className={`text-sm transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {getOtherParticipant(selectedConversation).isOnline ? 'Online' : 'Last seen recently'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const otherParticipant = getOtherParticipant(selectedConversation);
                    console.log('📞 Call button clicked:', {
                      selectedConversation,
                      otherParticipant,
                      receiverId: otherParticipant._id
                    });
                    initiateCall(otherParticipant._id);
                  }}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title="Start Audio Call"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`} title="Start Video Call">
                  <Video className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowCallHistory(true)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title="Call History"
                >
                  <History className="w-5 h-5" />
                </button>
                <button className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`} title="Conversation Info">
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

      
          <div className="flex-1 overflow-y-auto space-y-4 min-h-0 p-4">
            {(() => {
              return null;
            })()}
            {messages.length > 0 ? (
              messages.map((message) => {
                const currentUserId = getCurrentUserId();
                const isOwn = message.sender._id === currentUserId;
                const isRead = message.isRead;
              
              return (
                <div
                  key={message._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div className={`max-w-xs sm:max-w-sm lg:max-w-md px-3 sm:px-4 py-2 rounded-2xl transition-colors duration-200 ${
                    isOwn
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-200 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${
                      isOwn ? 'text-blue-100' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {isOwn && (
                        <div className="ml-1">
                          <Check className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <MessageCircle className={`w-8 h-8 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <h3 className={`text-lg font-medium mb-2 transition-colors duration-200 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Start the conversation
                </h3>
                <p className={`text-sm transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Send a message to begin chatting
                </p>
              </div>
            )}
          
            {isTyping && (
              <div className="flex justify-start">
                <div className={`px-4 py-2 rounded-2xl transition-colors duration-200 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div className="flex items-center gap-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className={`text-xs ml-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {getOtherParticipant(selectedConversation).name} is typing...
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {isTyping && typingUsers.length > 0 && (
              <div className={`px-4 py-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span>
                    {typingUsers.length === 1 ? 'Someone is typing...' : `${typingUsers.length} people are typing...`}
                  </span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className={`p-3 sm:p-4 border-t transition-colors duration-200 flex-shrink-0 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {replyingTo && (
              <div className={`mb-3 p-3 rounded-lg border-l-4 border-blue-500 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-600'
                    }`}>
                      Replying to {replyingTo.sender.name}
                    </p>
                    <p className={`text-sm truncate ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {replyingTo.content}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className={`p-1 rounded ${
                      isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-end gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => imageInputRef.current?.click()}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                    onChange={(e) => {
                    setNewMessage(e.target.value);
                    
                    if (selectedConversation && e.target.value.trim()) {
                      socketService.startTyping(selectedConversation._id);
                    } else if (selectedConversation) {
                      socketService.stopTyping(selectedConversation._id);
                    }
                    
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 rounded-2xl border-0 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200 text-sm sm:text-base ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={1}
                  style={{ minHeight: '40px', maxHeight: '120px', height: '40px' }}
                />
                
                <button className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-600 text-gray-300' 
                    : 'hover:bg-gray-200 text-gray-600'
                }`}>
                  <Smile className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  newMessage.trim() && !sending
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => {
            }}
          />
          <input
            ref={imageInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
            }}
          />
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className={`text-lg font-medium mb-2 transition-colors duration-200 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Select a conversation
            </h3>
            <p className={`text-sm transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Choose a conversation from the sidebar to start messaging
            </p>
          </div>
        </div>
      )}

      {/* Audio Call Interface */}
      <AudioCallInterface
        isVisible={showCallInterface}
        callType={callType}
        caller={caller}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEnd={endCall}
        onCancel={cancelCall}
        onMuteToggle={toggleMute}
        onSpeakerToggle={toggleSpeaker}
        isMuted={isMuted}
        isSpeakerOn={isSpeakerOn}
        callDuration={currentCall?.duration || 0}
        connectionQuality="good"
      />

      {/* Call History */}
      <CallHistory
        userId={getCurrentUserId() || ''}
        isVisible={showCallHistory}
        onClose={() => setShowCallHistory(false)}
      />

      {/* Hidden audio elements for WebRTC */}
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
}       