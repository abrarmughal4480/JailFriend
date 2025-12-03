const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

// Wallet routes
router.get('/', authMiddleware, walletController.getWalletData);
router.post('/bank-transfer', authMiddleware, upload.single('receipt'), walletController.submitBankReceipt);

module.exports = router;
