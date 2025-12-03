const Advertisement = require('../models/advertisement');
const User = require('../models/user');

// Create new advertisement
exports.createAdvertisement = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            companyName,
            title,
            description,
            websiteUrl,
            pageId,
            startDate,
            endDate,
            placement,
            bidding,
            location,
            audience,
            budget,
            gender
        } = req.body;

        // Validate required fields
        if (!companyName || !title || !description || !startDate || !endDate || !budget) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Parse and validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Invalid start or end date' });
        }

        // Start date cannot be before today
        if (start < today) {
            return res.status(400).json({ error: 'Start date cannot be earlier than today' });
        }

        // End date cannot be before start date
        if (end < start) {
            return res.status(400).json({ error: 'End date cannot be earlier than start date' });
        }

        // Validate budget
        const budgetAmount = parseFloat(budget);
        if (isNaN(budgetAmount) || budgetAmount <= 0) {
            return res.status(400).json({ error: 'Invalid budget amount' });
        }

        // Check if image was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'Advertisement image is required' });
        }

        // Get user and check wallet balance
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.balance < budgetAmount) {
            return res.status(400).json({
                error: 'Insufficient wallet balance',
                required: budgetAmount,
                available: user.balance
            });
        }

        // Deduct budget from user's wallet
        user.balance -= budgetAmount;
        await user.save();

        // Create advertisement
        const advertisement = new Advertisement({
            userId,
            companyName,
            title,
            description,
            imageUrl: req.file.path, // Cloudinary URL
            websiteUrl: websiteUrl || null,
            pageId: pageId || null,
            startDate: start,
            endDate: end,
            placement: placement || 'Entire Site (File Format image)',
            bidding: bidding || 'Pay Per Click ($0.075)',
            location: location || null,
            audience: audience || 'Nothing selected',
            budget: budgetAmount,
            gender: gender || 'All',
            status: 'active'
        });

        await advertisement.save();

        res.status(201).json({
            message: 'Advertisement created successfully',
            advertisement,
            newBalance: user.balance
        });
    } catch (error) {
        console.error('Error creating advertisement:', error);
        res.status(500).json({ error: 'Failed to create advertisement' });
    }
};

// Get user's advertisements
exports.getUserAdvertisements = async (req, res) => {
    try {
        const userId = req.user.id;

        const advertisements = await Advertisement.find({ userId })
            .sort({ createdAt: -1 })
            .populate('userId', 'name username avatar')
            .populate('pageId', 'name');

        res.json(advertisements);
    } catch (error) {
        console.error('Error fetching user advertisements:', error);
        res.status(500).json({ error: 'Failed to fetch advertisements' });
    }
};

// Get active advertisements for feed
exports.getActiveAdvertisements = async (req, res) => {
    try {
        const now = new Date();

        const advertisements = await Advertisement.find({
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gte: now }
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('userId', 'name username avatar')
            .populate('pageId', 'name');

        res.json(advertisements);
    } catch (error) {
        console.error('Error fetching active advertisements:', error);
        res.status(500).json({ error: 'Failed to fetch advertisements' });
    }
};

// Update advertisement
exports.updateAdvertisement = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const updates = req.body;

        // Find advertisement
        const advertisement = await Advertisement.findById(id);
        if (!advertisement) {
            return res.status(404).json({ error: 'Advertisement not found' });
        }

        // Check ownership
        if (advertisement.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this advertisement' });
        }

        // Don't allow budget changes
        delete updates.budget;
        delete updates.userId;

        // Update advertisement
        Object.assign(advertisement, updates);
        await advertisement.save();

        res.json({
            message: 'Advertisement updated successfully',
            advertisement
        });
    } catch (error) {
        console.error('Error updating advertisement:', error);
        res.status(500).json({ error: 'Failed to update advertisement' });
    }
};

// Delete advertisement
exports.deleteAdvertisement = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Find advertisement
        const advertisement = await Advertisement.findById(id);
        if (!advertisement) {
            return res.status(404).json({ error: 'Advertisement not found' });
        }

        // Check ownership
        if (advertisement.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this advertisement' });
        }

        await Advertisement.findByIdAndDelete(id);

        res.json({ message: 'Advertisement deleted successfully' });
    } catch (error) {
        console.error('Error deleting advertisement:', error);
        res.status(500).json({ error: 'Failed to delete advertisement' });
    }
};

// Track advertisement view
exports.trackAdView = async (req, res) => {
    try {
        const { id } = req.params;

        const advertisement = await Advertisement.findById(id);
        if (!advertisement) {
            return res.status(404).json({ error: 'Advertisement not found' });
        }

        advertisement.views += 1;
        await advertisement.save();

        res.json({ message: 'View tracked', views: advertisement.views });
    } catch (error) {
        console.error('Error tracking ad view:', error);
        res.status(500).json({ error: 'Failed to track view' });
    }
};

// Track advertisement click
exports.trackAdClick = async (req, res) => {
    try {
        const { id } = req.params;

        const advertisement = await Advertisement.findById(id);
        if (!advertisement) {
            return res.status(404).json({ error: 'Advertisement not found' });
        }

        advertisement.clicks += 1;
        await advertisement.save();

        res.json({ message: 'Click tracked', clicks: advertisement.clicks });
    } catch (error) {
        console.error('Error tracking ad click:', error);
        res.status(500).json({ error: 'Failed to track click' });
    }
};
