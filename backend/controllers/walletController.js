const BankReceipt = require('../models/BankReceipt');
const User = require('../models/user');
const PaymentTransaction = require('../models/PaymentTransaction');

// Submit bank transfer receipt
exports.submitBankReceipt = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'Receipt image is required' });
        }

        // Create bank receipt record
        const bankReceipt = new BankReceipt({
            userId,
            amount: parseFloat(amount),
            receiptUrl: req.file.path, // Cloudinary URL
            status: 'pending'
        });

        await bankReceipt.save();

        res.status(201).json({
            message: 'Receipt submitted successfully',
            receipt: bankReceipt
        });
    } catch (error) {
        console.error('Error submitting bank receipt:', error);
        res.status(500).json({ error: 'Failed to submit receipt' });
    }
};

// Process instant payment (for all payment gateways except bank transfer)
exports.processInstantPayment = async (req, res) => {
    try {
        const { amount, paymentMethod, paymentDetails } = req.body;
        const userId = req.user.id;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Validate payment method
        const validMethods = ['paypal', 'qiwi', 'credit-card', '2checkout', 'paystack',
            'cashfree', 'flutterwave', 'coingate', 'aamarapay',
            'ngenius', 'iyzico', 'payfast', 'bitcoin', 'alipay'];

        if (!paymentMethod || !validMethods.includes(paymentMethod)) {
            return res.status(400).json({ error: 'Invalid payment method' });
        }

        // Create payment transaction record
        const paymentTransaction = new PaymentTransaction({
            userId,
            amount: parseFloat(amount),
            paymentMethod,
            paymentDetails: paymentDetails || {},
            status: 'completed'
        });

        await paymentTransaction.save();

        // Update user balance immediately
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.balance = (parseFloat(user.balance) || 0) + parseFloat(amount);
        await user.save();

        // Dispatch balance update event
        global.io?.to(userId.toString()).emit('balanceUpdated', { balance: user.balance });

        res.status(201).json({
            message: 'Payment processed successfully',
            transaction: paymentTransaction,
            newBalance: user.balance
        });
    } catch (error) {
        console.error('Error processing instant payment:', error);
        res.status(500).json({ error: 'Failed to process payment' });
    }
};

// Get wallet data (balance and transactions)
exports.getWalletData = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user balance
        const user = await User.findById(userId).select('balance');

        // Get user's bank receipts as transactions
        const receipts = await BankReceipt.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);

        // Get user's payment transactions
        const payments = await PaymentTransaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);

        // Get user's advertisements as transactions
        const Advertisement = require('../models/advertisement');
        const advertisements = await Advertisement.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);

        // Format bank receipt transactions
        const receiptTransactions = receipts.map(receipt => ({
            _id: receipt._id,
            type: 'WALLET',
            status: receipt.status === 'approved' ? 'bank receipts' : receipt.status,
            date: receipt.createdAt,
            amount: receipt.amount
        }));

        // Format payment transactions
        const paymentTransactions = payments.map(payment => ({
            _id: payment._id,
            type: 'WALLET',
            status: payment.paymentMethod,
            date: payment.createdAt,
            amount: (payment.paymentDetails?.type === 'deduction') ? -payment.amount : payment.amount,
            description: payment.paymentDetails?.description || `Wallet Transaction: ${payment.paymentMethod}`
        }));

        // Format advertisement transactions
        const adTransactions = advertisements.map(ad => ({
            _id: ad._id,
            type: 'ADVERTISEMENT',
            status: 'completed',
            date: ad.createdAt,
            amount: -ad.budget, // Negative because it's a deduction
            description: `Ad Campaign: ${ad.title}`
        }));

        // Combine and sort all transactions
        const transactions = [...receiptTransactions, ...paymentTransactions, ...adTransactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 50);

        res.json({
            balance: user?.balance || 0,
            transactions
        });
    } catch (error) {
        console.error('Error fetching wallet data:', error);
        res.status(500).json({ error: 'Failed to fetch wallet data' });
    }
};
