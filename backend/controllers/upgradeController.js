const User = require('../models/user');
const ProPackage = require('../models/proPackage');

// Upgrade user plan with wallet deduction
exports.upgradePlan = async (req, res) => {
    try {
        const { userId, plan, billing, packageId } = req.body;

        // Validate basic input
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        // Get user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let selectedPackage;

        // Strategy 1: Look up by packageId (Preferred)
        if (packageId) {
            selectedPackage = await ProPackage.findById(packageId);
        }
        // Strategy 2: Look up by name (Fallback/Legacy)
        else if (plan && billing) {
            // Try to find a package that matches name and duration unit
            // Map billing 'monthly' -> 'Month', 'yearly' -> 'Year' if needed
            const durationUnit = billing === 'monthly' ? 'Month' : (billing === 'yearly' ? 'Year' : billing);
            selectedPackage = await ProPackage.findOne({ name: plan, durationUnit: durationUnit, status: 'enabled' });

            // If not found, maybe just find by name (and assume price handling?? No, stick to strict)
        }

        if (!selectedPackage) {
            console.log("Plan not found for:", { packageId, plan, billing }); // Debug log
            return res.status(404).json({ error: 'Selected plan not found or is disabled' });
        }

        if (selectedPackage.status !== 'enabled') {
            return res.status(400).json({ error: 'This plan is currently disabled' });
        }

        const planPrice = selectedPackage.price;

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
        user.plan = selectedPackage.name; // Store the package name

        // Calculate expiration date
        const expirationDate = new Date();
        const { duration, durationUnit } = selectedPackage;

        if (durationUnit === 'Day') {
            expirationDate.setDate(expirationDate.getDate() + duration);
        } else if (durationUnit === 'Week') {
            expirationDate.setDate(expirationDate.getDate() + (duration * 7));
        } else if (durationUnit === 'Month') {
            expirationDate.setMonth(expirationDate.getMonth() + duration);
        } else if (durationUnit === 'Year') {
            expirationDate.setFullYear(expirationDate.getFullYear() + duration);
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
                plan: selectedPackage.name,
                billing: durationUnit,
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
        // Fetch all enabled package names to filter users
        const packages = await ProPackage.find({ status: 'enabled' }).select('name');
        const packageNames = packages.map(p => p.name);
        // Also include legacy hardcoded names just in case
        const allProNames = [...new Set([...packageNames, 'Star', 'Hot', 'Ultima', 'VIP'])];

        const proMembers = await User.find({
            plan: { $in: allProNames }
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
