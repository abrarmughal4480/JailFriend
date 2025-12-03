const mongoose = require('mongoose');

const bankReceiptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    receiptUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    processedAt: {
        type: Date,
        default: null
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
bankReceiptSchema.index({ status: 1, createdAt: -1 });
bankReceiptSchema.index({ userId: 1 });

module.exports = mongoose.model('BankReceipt', bankReceiptSchema);
