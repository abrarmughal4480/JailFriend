const Message = require('../models/message');
const User = require('../models/user');
const mongoose = require('mongoose');

// Save message to database
exports.saveMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content, messageType = 'text', mediaUrl, replyTo } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sender ID, Receiver ID, and content are required' 
      });
    }

    const message = new Message({
      senderId,
      receiverId,
      content,
      messageType,
      mediaUrl: mediaUrl || '',
      replyTo: replyTo || null
    });

    const savedMessage = await message.save();
    
    // Populate sender and receiver details
    await savedMessage.populate([
      { path: 'senderId', select: 'name username avatar' },
      { path: 'receiverId', select: 'name username avatar' },
      { path: 'replyTo', select: 'content senderId' }
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

    // Get all unique conversations for this user
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
