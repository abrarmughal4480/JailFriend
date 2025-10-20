const Message = require('../models/message');
const Conversation = require('../models/conversation');
const User = require('../models/user');
const P2PProfile = require('../models/p2pProfile');
const Booking = require('../models/booking');
const mongoose = require('mongoose');

// Enhanced helper function to create or update conversation with P2P context
const createOrUpdateConversation = async (senderId, receiverId, messageId, conversationContext = {}) => {
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
};

// Save message to database
exports.saveMessage = async (req, res) => {
  try {
    const { 
      senderId, 
      receiverId, 
      content, 
      messageType = 'text', 
      mediaUrl, 
      replyTo,
      // P2P Context fields
      conversationContext = {}
    } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sender ID, Receiver ID, and content are required' 
      });
    }

    // Create message with P2P context
    const message = new Message({
      senderId,
      receiverId,
      content,
      messageType,
      mediaUrl: mediaUrl || '',
      replyTo: replyTo || null,
      conversationContext: {
        type: conversationContext.type || 'regular',
        bookingId: conversationContext.bookingId || null,
        p2pProfileId: conversationContext.p2pProfileId || null,
        serviceType: conversationContext.serviceType || null,
        userRole: conversationContext.userRole || null,
        source: conversationContext.source || 'regular_message'
      }
    });

    const savedMessage = await message.save();
    
    // Create or update conversation with P2P context
    await createOrUpdateConversation(senderId, receiverId, savedMessage._id, conversationContext);
    
    // Populate sender and receiver details
    await savedMessage.populate([
      { path: 'senderId', select: 'name username avatar' },
      { path: 'receiverId', select: 'name username avatar' },
      { path: 'replyTo', select: 'content senderId' },
      { path: 'conversationContext.bookingId', select: 'title serviceType totalAmount' },
      { path: 'conversationContext.p2pProfileId', select: 'occupation hourlyRate currency' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Message saved successfully',
      data: savedMessage
    });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving message',
      error: error.message
    });
  }
};

// Get conversation messages between two users
exports.getConversationMessages = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    if (!userId1 || !userId2) {
      return res.status(400).json({
        success: false,
        message: 'Both user IDs are required'
      });
    }

    // Find messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ],
      isDeleted: false
    })
    .populate('senderId', 'name username avatar')
    .populate('receiverId', 'name username avatar')
    .populate('replyTo', 'content senderId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalMessages = await Message.countDocuments({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ],
      isDeleted: false
    });

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasNextPage: page * limit < totalMessages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation messages',
      error: error.message
    });
  }
};

// Get user's conversations (list of people they've chatted with)
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    console.log('🔍 Getting conversations for user:', userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // First, let's check if there are any messages for this user
    const messageCount = await Message.countDocuments({
      $or: [
        { senderId: new mongoose.Types.ObjectId(userId) },
        { receiverId: new mongoose.Types.ObjectId(userId) }
      ],
      isDeleted: false
    });

    console.log('📊 Total messages for user:', messageCount);

    if (messageCount === 0) {
      return res.json({
        success: true,
        conversations: []
      });
    }

    // Get all unique conversations for this user with P2P context
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) }
          ],
          isDeleted: false
        }
      },
      {
        $addFields: {
          otherUserId: {
            $cond: [
              { $eq: ['$senderId', new mongoose.Types.ObjectId(userId)] },
              '$receiverId',
              '$senderId'
            ]
          }
        }
      },
      {
        $group: {
          _id: '$otherUserId',
          lastMessage: { $last: '$$ROOT' },
          conversationContext: { $last: '$conversationContext' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', new mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $unwind: '$otherUser'
      },
      {
        $lookup: {
          from: 'p2pprofiles',
          localField: 'conversationContext.p2pProfileId',
          foreignField: '_id',
          as: 'p2pProfile'
        }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: 'conversationContext.bookingId',
          foreignField: '_id',
          as: 'booking'
        }
      },
      {
        $project: {
          _id: 1,
          otherUser: {
            _id: '$otherUser._id',
            name: '$otherUser.name',
            username: '$otherUser.username',
            avatar: '$otherUser.avatar',
            isOnline: '$otherUser.isOnline',
            lastSeen: '$otherUser.lastSeen'
          },
          lastMessage: {
            _id: '$lastMessage._id',
            content: '$lastMessage.content',
            messageType: '$lastMessage.messageType',
            createdAt: '$lastMessage.createdAt',
            isRead: '$lastMessage.isRead'
          },
          conversationContext: {
            type: '$conversationContext.type',
            source: '$conversationContext.source',
            userRole: '$conversationContext.userRole',
            serviceType: '$conversationContext.serviceType'
          },
          p2pProfile: {
            $arrayElemAt: ['$p2pProfile', 0]
          },
          booking: {
            $arrayElemAt: ['$booking', 0]
          },
          unreadCount: 1,
          updatedAt: '$lastMessage.createdAt'
        }
      },
      {
        $sort: { updatedAt: -1 }
      }
    ]);

    console.log('✅ Conversations found:', conversations.length);

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('❌ Error getting user conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Parse conversation ID to get the two user IDs
    const [userId1, userId2] = conversationId.split('-');
    
    if (!userId1 || !userId2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID'
      });
    }

    // Mark messages as read where current user is the receiver
    const result = await Message.updateMany(
      {
        $or: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 }
        ],
        receiverId: userId,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: error.message
    });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender or receiver
    if (message.senderId.toString() !== userId && message.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    // Add user to deletedBy array
    message.deletedBy.push({
      userId: userId,
      deletedAt: new Date()
    });

    // If both users have deleted the message, mark as deleted
    if (message.deletedBy.length >= 2) {
      message.isDeleted = true;
    }

    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};

// Get unread message count for user
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false,
      isDeleted: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting unread count',
      error: error.message
    });
  }
};

// Create P2P conversation from P2P service contact
exports.createP2PConversation = async (req, res) => {
  try {
    const { serviceProviderId, p2pProfileId, source = 'p2p_contact' } = req.body;
    const clientId = req.user.id;

    if (!serviceProviderId || !p2pProfileId) {
      return res.status(400).json({
        success: false,
        message: 'Service provider ID and P2P profile ID are required'
      });
    }

    // Check if user is trying to contact themselves
    if (clientId === serviceProviderId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot contact yourself'
      });
    }

    // Get P2P profile details
    const p2pProfile = await P2PProfile.findById(p2pProfileId)
      .populate('userId', 'name username avatar');

    if (!p2pProfile || p2pProfile.userId._id.toString() !== serviceProviderId) {
      return res.status(404).json({
        success: false,
        message: 'P2P profile not found or does not belong to the service provider'
      });
    }

    // Check if conversation already exists
    const sortedIds = [clientId, serviceProviderId].sort();
    const conversationId = `${sortedIds[0]}-${sortedIds[1]}`;
    
    const existingConversation = await Conversation.findOne({ conversationId });
    
    if (existingConversation) {
      return res.status(200).json({
        success: true,
        message: 'Conversation already exists',
        conversation: existingConversation
      });
    }

    // Create initial message
    const initialMessage = new Message({
      senderId: clientId,
      receiverId: serviceProviderId,
      content: `Hi! I'm interested in your ${p2pProfile.occupation} services. Let's discuss how you can help me.`,
      messageType: 'text',
      conversationContext: {
        type: 'p2p_service',
        p2pProfileId: p2pProfileId,
        serviceType: 'consultation',
        userRole: 'client',
        source: source
      }
    });

    const savedMessage = await initialMessage.save();

    // Create conversation with P2P context
    const conversationContext = {
      type: 'p2p_service',
      p2pContext: {
        p2pProfileId: p2pProfileId,
        serviceProviderId: serviceProviderId,
        clientId: clientId,
        serviceType: 'consultation',
        source: source,
        hourlyRate: p2pProfile.hourlyRate,
        currency: p2pProfile.currency,
        serviceTitle: p2pProfile.occupation
      }
    };

    const conversation = await createOrUpdateConversation(
      clientId, 
      serviceProviderId, 
      savedMessage._id, 
      conversationContext
    );

    // Populate the message
    await savedMessage.populate([
      { path: 'senderId', select: 'name username avatar' },
      { path: 'receiverId', select: 'name username avatar' },
      { path: 'conversationContext.p2pProfileId', select: 'occupation hourlyRate currency' }
    ]);

    res.status(201).json({
      success: true,
      message: 'P2P conversation created successfully',
      conversation,
      initialMessage: savedMessage
    });
  } catch (error) {
    console.error('Error creating P2P conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating P2P conversation',
      error: error.message
    });
  }
};

// Get conversations by type (regular, p2p_service, p2p_booking)
exports.getConversationsByType = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'all' } = req.query;

    let matchQuery = {
      $or: [
        { senderId: new mongoose.Types.ObjectId(userId) },
        { receiverId: new mongoose.Types.ObjectId(userId) }
      ],
      isDeleted: false
    };

    // Filter by conversation type
    if (type !== 'all') {
      matchQuery['conversationContext.type'] = type;
    }

    const conversations = await Message.aggregate([
      { $match: matchQuery },
      {
        $addFields: {
          otherUserId: {
            $cond: [
              { $eq: ['$senderId', new mongoose.Types.ObjectId(userId)] },
              '$receiverId',
              '$senderId'
            ]
          }
        }
      },
      {
        $group: {
          _id: '$otherUserId',
          lastMessage: { $last: '$$ROOT' },
          conversationContext: { $last: '$conversationContext' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', new mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $unwind: '$otherUser'
      },
      {
        $lookup: {
          from: 'p2pprofiles',
          localField: 'conversationContext.p2pProfileId',
          foreignField: '_id',
          as: 'p2pProfile'
        }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: 'conversationContext.bookingId',
          foreignField: '_id',
          as: 'booking'
        }
      },
      {
        $project: {
          _id: 1,
          otherUser: {
            _id: '$otherUser._id',
            name: '$otherUser.name',
            username: '$otherUser.username',
            avatar: '$otherUser.avatar',
            isOnline: '$otherUser.isOnline',
            lastSeen: '$otherUser.lastSeen'
          },
          lastMessage: {
            _id: '$lastMessage._id',
            content: '$lastMessage.content',
            messageType: '$lastMessage.messageType',
            createdAt: '$lastMessage.createdAt',
            isRead: '$lastMessage.isRead'
          },
          conversationContext: {
            type: '$conversationContext.type',
            source: '$conversationContext.source',
            userRole: '$conversationContext.userRole',
            serviceType: '$conversationContext.serviceType'
          },
          p2pProfile: {
            $arrayElemAt: ['$p2pProfile', 0]
          },
          booking: {
            $arrayElemAt: ['$booking', 0]
          },
          unreadCount: 1,
          updatedAt: '$lastMessage.createdAt'
        }
      },
      {
        $sort: { updatedAt: -1 }
      }
    ]);

    res.json({
      success: true,
      conversations,
      type: type
    });
  } catch (error) {
    console.error('Error getting conversations by type:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};
