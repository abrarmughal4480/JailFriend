const mongoose = require('mongoose');
const VideoCall = require('./models/videoCall');
const Booking = require('./models/booking');
require('dotenv').config();

async function check() {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/fedup';
    await mongoose.connect(mongoURI);
    const call = await VideoCall.findById('6943242bce96beb0d1586ace').populate('bookingId');
    console.log(JSON.stringify(call, null, 2));
    process.exit(0);
}

check();
