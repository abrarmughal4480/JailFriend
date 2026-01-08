const mongoose = require('mongoose');
const LiveStream = require('./backend/models/liveStream');
require('dotenv').config({ path: './backend/.env' });

async function checkStreams() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prison-network');
        console.log('Connected to MongoDB');

        const activeStreams = await LiveStream.find({ status: 'live' });
        console.log(`Found ${activeStreams.length} active streams`);
        activeStreams.forEach(s => {
            console.log(`- ID: ${s._id}, Check hostId: ${s.hostId}, Title: ${s.title}`);
        });

        const allStreams = await LiveStream.find({});
        console.log(`Total streams in DB: ${allStreams.length}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkStreams();
