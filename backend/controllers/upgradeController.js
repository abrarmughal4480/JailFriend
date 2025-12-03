const User = require('../models/user');

// Plan pricing
const PLAN_PRICES = {
    Star: { monthly: 4, yearly: 40 },
    Hot: { monthly: 8, yearly: 80 },
    Ultima: { monthly: 89, yearly: 890 },
    VIP: { monthly: 259, yearly: 2590 }
};

// Upgrade user plan with wallet deduction
exports.upgradePlan = async (req, res) => {
    try {
        const { userId, plan, billing } = req.body;

        // Validate input
        if (!userId || !plan || !billing) {
            return res.status(400).json({ error: 'userId, plan, and billing are required' });
        }

        if (!['Star', 'Hot', 'Ultima', 'VIP'].includes(plan)) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        if (!['monthly', 'yearly'].includes(billing)) {
            return res.status(400).json({ error: 'Invalid billing period' });
        }

        // Get user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get plan price
        const planPrice = PLAN_PRICES[plan][billing];

        // Check wallet balance
        if (user.balance < planPrice) {
            return res.status(400).json({
                error: 'Insufficient balance',
                required: planPrice,
                current: user.balance,
                shortfall: planPrice - user.balance
            });
        }

        // Deduct from wallet
        user.balance -= planPrice;
        user.plan = plan;

        // Set expiration date
        const expirationDate = new Date();
        if (billing === 'monthly') {
            expirationDate.setMonth(expirationDate.getMonth() + 1);
        } else {
            expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        }
        user.planExpiresAt = expirationDate;

        await user.save();

        res.json({
            success: true,
            message: 'Upgrade successful!',
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                plan: user.plan,
                planExpiresAt: user.planExpiresAt,
                balance: user.balance
            },
            transaction: {
                type: 'PLAN_UPGRADE',
                plan,
                billing,
                amount: -planPrice,
                date: new Date()
            }
        });
    } catch (error) {
        console.error('Error upgrading plan:', error);
        res.status(500).json({ error: 'Server error during upgrade' });
    }
};

// Get list of pro members
exports.getProMembers = async (req, res) => {
    try {
        const proMembers = await User.find({
            plan: { $in: ['Star', 'Hot', 'Ultima', 'VIP'] }
        })
            .select('name username avatar plan')
            .sort({ planExpiresAt: -1 })
            .limit(20);

        res.json({
            success: true,
            members: proMembers,
            count: proMembers.length
        });
    } catch (error) {
        console.error('Error fetching pro members:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
