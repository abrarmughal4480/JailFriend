const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createCategory: createP2PCategory,
  getCategories: getP2PCategories,
  updateCategory: updateP2PCategory,
  deleteCategory: deleteP2PCategory
} = require('../controllers/p2pCategoryController');
const { upload } = require('../config/cloudinary');

// Admin dashboard statistics
router.get('/stats', authMiddleware, adminController.getDashboardStats);
router.get('/users', authMiddleware, adminController.getUsers);
router.get('/posts', authMiddleware, adminController.getPosts);
router.get('/comments', authMiddleware, adminController.getComments);
router.get('/groups', authMiddleware, adminController.getGroups);
router.get('/pages', authMiddleware, adminController.getPages);
router.get('/games', authMiddleware, adminController.getGames);
router.get('/messages', authMiddleware, adminController.getMessages);

// User management routes
router.post('/users/:userId/verify', authMiddleware, adminController.verifyUser);
router.post('/users/:userId/unverify', authMiddleware, adminController.unverifyUser);
router.post('/users/:userId/block', authMiddleware, adminController.blockUser);
router.post('/users/:userId/unblock', authMiddleware, adminController.unblockUser);
router.post('/users/:userId/delete', authMiddleware, adminController.deleteUser);
router.post('/users/:userId/kick', authMiddleware, adminController.kickUser);
router.post('/users/bulk/:action', authMiddleware, adminController.bulkAction);
router.get('/users/stats', authMiddleware, adminController.getUserStats);
router.get('/users/online', authMiddleware, adminController.getOnlineUsers);

// P2P categories management
router.get('/p2p/categories', authMiddleware, getP2PCategories);
router.post('/p2p/categories', authMiddleware, upload.single('image'), createP2PCategory);
router.put('/p2p/categories/:categoryId', authMiddleware, upload.single('image'), updateP2PCategory);
router.delete('/p2p/categories/:categoryId', authMiddleware, deleteP2PCategory);

// Bank receipts management
router.get('/bank-receipts', authMiddleware, adminController.getBankReceipts);
router.post('/bank-receipts/:id/approve', authMiddleware, adminController.approveBankReceipt);
router.post('/bank-receipts/:id/reject', authMiddleware, adminController.rejectBankReceipt);

module.exports = router; 