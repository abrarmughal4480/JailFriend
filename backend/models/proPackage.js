const mongoose = require('mongoose');

const proPackageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    color: { type: String, default: '#000000' },
    status: { type: String, enum: ['enabled', 'disabled'], default: 'enabled' },
    featured: { type: Boolean, default: false },
    seeProfileVisitors: { type: Boolean, default: false },
    showLastSeen: { type: Boolean, default: false },
    verifiedBadge: { type: Boolean, default: false },
    pagesPromotion: { type: Number, default: 0 },
    postsPromotion: { type: Number, default: 0 },
    maxUploadSize: { type: String, default: '24 MB' },
    discount: { type: Number, default: 0 },
    duration: { type: Number, default: 1 },
    durationUnit: { type: String, enum: ['Day', 'Week', 'Month', 'Year'], default: 'Month' },
    icon: { type: String, default: '' },
    nightIcon: { type: String, default: '' },
    description: { type: String, default: '' }
}, {
    timestamps: true
});

module.exports = mongoose.model('ProPackage', proPackageSchema);
