const BankReceipt = require('../models/BankReceipt');
const User = require('../models/user');

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
        const transactions = [...receiptTransactions, ...adTransactions]
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
