const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');

// Save message to database
router.post('/save', authMiddleware, messageController.saveMessage);

// Get conversation messages between two users
router.get('/conversation/:userId1/:userId2', authMiddleware, messageController.getConversationMessages);

// Get user's conversations list
router.get('/conversations', authMiddleware, messageController.getUserConversations);

// Mark messages as read
router.put('/read/:conversationId', authMiddleware, messageController.markMessagesAsRead);

// Delete message
router.delete('/:messageId', authMiddleware, messageController.deleteMessage);

// Get unread message count
router.get('/unread-count', authMiddleware, messageController.getUnreadCount);

module.exports = router;
