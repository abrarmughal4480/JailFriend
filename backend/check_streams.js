const mongoose = require('mongoose');
const LiveStream = require('./models/liveStream');
require('dotenv').config();

async function checkStreams() {
    try {
        const dbName = process.env.MONGO_URI || 'mongodb://localhost:27017/fedup';
        console.log('Connecting to:', dbName);
        await mongoose.connect(dbName);
        console.log('Connected to MongoDB');

        const activeStreams = await LiveStream.find({ status: 'live' });
        console.log(`Found ${activeStreams.length} active streams`);
        activeStreams.forEach(s => {
            console.log(`- ID: ${s._id}, Host: ${s.hostId}, Title: ${s.title}`);
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
