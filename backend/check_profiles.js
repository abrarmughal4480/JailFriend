const mongoose = require('mongoose');
const P2PProfile = require('./models/p2pProfile');
require('dotenv').config();

async function check() {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/fedup';
    await mongoose.connect(mongoURI);
    const profiles = await P2PProfile.find({});
    console.log(JSON.stringify(profiles.map(p => ({
        userId: p.userId,
        workingHours: p.workingHours,
        availableFromTime: p.availableFromTime,
        availableToTime: p.availableToTime
    })), null, 2));
    process.exit(0);
}

check();
