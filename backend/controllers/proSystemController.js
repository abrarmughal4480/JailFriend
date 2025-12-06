const WebsiteSettings = require('../models/websiteSettings');
const ProPackage = require('../models/proPackage');

// Update Pro System global settings
exports.updateProSystemSettings = async (req, res) => {
    try {
        const { enabled, recurringPayment, refundSystem, proMembershipOnSignUp } = req.body;

        // Validate inputs (optional but recommended)
        if (typeof enabled !== 'boolean') {
            return res.status(400).json({ message: 'Invalid value for enabled' });
        }

        let settings = await WebsiteSettings.findOne();
        if (!settings) {
            settings = new WebsiteSettings();
        }

        // Ensure proSystem object exists if it wasn't there before
        if (!settings.proSystem) {
            settings.proSystem = {};
        }

        settings.proSystem.enabled = enabled;
        settings.proSystem.recurringPayment = recurringPayment;
        settings.proSystem.refundSystem = refundSystem;
        settings.proSystem.proMembershipOnSignUp = proMembershipOnSignUp;

        await settings.save();

        res.status(200).json({ message: 'Pro System settings updated', settings: settings.proSystem });
    } catch (error) {
        console.error('Error updating Pro System settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all Pro Packages
exports.getProPackages = async (req, res) => {
    try {
        const packages = await ProPackage.find().sort({ price: 1 });
        res.status(200).json(packages);
    } catch (error) {
        console.error('Error fetching Pro Packages:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new Pro Package
exports.createProPackage = async (req, res) => {
    try {
        const packageData = req.body;

        // Handle file uploads
        if (req.files) {
            if (req.files.icon && req.files.icon[0]) {
                packageData.icon = req.files.icon[0].path;
            }
            if (req.files.nightIcon && req.files.nightIcon[0]) {
                packageData.nightIcon = req.files.nightIcon[0].path;
            }
        }

        const newPackage = new ProPackage(packageData);
        await newPackage.save();
        res.status(201).json(newPackage);
    } catch (error) {
        console.error('Error creating Pro Package:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update an existing Pro Package
exports.updateProPackage = async (req, res) => {
    try {
        const { id } = req.params;
        const packageData = req.body;

        // Handle file uploads
        if (req.files) {
            if (req.files.icon && req.files.icon[0]) {
                packageData.icon = req.files.icon[0].path;
            }
            if (req.files.nightIcon && req.files.nightIcon[0]) {
                packageData.nightIcon = req.files.nightIcon[0].path;
            }
        }

        const updatedPackage = await ProPackage.findByIdAndUpdate(id, packageData, { new: true });

        if (!updatedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }

        res.status(200).json(updatedPackage);
    } catch (error) {
        console.error('Error updating Pro Package:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a Pro Package
exports.deleteProPackage = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPackage = await ProPackage.findByIdAndDelete(id);

        if (!deletedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }

        res.status(200).json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error('Error deleting Pro Package:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Pro System Settings (for frontend initialization)
exports.getProSystemSettings = async (req, res) => {
    try {
        let settings = await WebsiteSettings.findOne();
        if (!settings) {
            settings = await WebsiteSettings.create({});
        }

        // Return default if proSystem is undefined (though schema default should handle it)
        const proSystemSettings = settings.proSystem || {
            enabled: true,
            recurringPayment: true,
            refundSystem: true,
            proMembershipOnSignUp: true
        };

        res.status(200).json(proSystemSettings);
    } catch (error) {
        console.error('Error fetching Pro System settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
