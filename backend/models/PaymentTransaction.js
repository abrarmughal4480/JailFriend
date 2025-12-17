const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
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
    paymentMethod: {
        type: String,
        required: true,
        enum: ['paypal', 'qiwi', 'credit-card', '2checkout', 'paystack', 'cashfree',
            'flutterwave', 'coingate', 'aamarapay', 'ngenius', 'iyzico', 'payfast',
            'bitcoin', 'alipay', 'wallet']
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        default: null
    },
    paymentDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
