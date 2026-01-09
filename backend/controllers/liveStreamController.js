const LiveStream = require('../models/liveStream');
const User = require('../models/user');

const socketService = require('../services/socketService');

// Start a live stream
const startStream = async (req, res) => {
    try {
        const hostId = req.user.id;
        const { title, description, category, settings } = req.body;

        // Check if user already has an active stream
        const activeStream = await LiveStream.findOne({ hostId, status: 'live' });
        if (activeStream) {
            return res.status(400).json({
                success: false,
                message: 'You already have an active live stream'
            });
        }

        const liveStream = new LiveStream({
            hostId,
            title,
            description,
            category,
            settings: settings || {
                allowComments: true,
                allowReactions: true,
                isPrivate: false
            }
        });

        await liveStream.save();
        await liveStream.populate('hostId', 'name username avatar');

        res.status(201).json({
            success: true,
            data: liveStream
        });
    } catch (error) {
        console.error('Error starting live stream:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// End a live stream
const endStream = async (req, res) => {
    try {
        const { streamId } = req.params;
        const userId = req.user.id;

        const stream = await LiveStream.findById(streamId);
        if (!stream) {
            return res.status(404).json({ success: false, message: 'Stream not found' });
        }

        if (stream.hostId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const { recordingUrl } = req.body;

        stream.status = 'ended';
        stream.endedAt = new Date();
        if (recordingUrl) {
            stream.recordingUrl = recordingUrl;
        }
        await stream.save();

        // Notify all viewers that the stream has ended
        if (socketService.io) {
            socketService.io.to(`live_stream_${streamId}`).emit('live_stream_ended', { streamId });
        }

        res.status(200).json({
            success: true,
            message: 'Stream ended successfully'
        });
    } catch (error) {
        console.error('Error ending live stream:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all active streams
const getActiveStreams = async (req, res) => {
    try {
        const streams = await LiveStream.find({ status: 'live' })
            .populate('hostId', 'name username avatar')
            .sort({ viewerCount: -1 });

        res.status(200).json({
            success: true,
            data: streams
        });
    } catch (error) {
        console.error('Error fetching active streams:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get stream details
const getStreamDetails = async (req, res) => {
    try {
        const { streamId } = req.params;
        const stream = await LiveStream.findById(streamId)
            .populate('hostId', 'name username avatar')
            .populate('guests', 'name username avatar');

        if (!stream) {
            return res.status(404).json({ success: false, message: 'Stream not found' });
        }

        res.status(200).json({
            success: true,
            data: stream
        });
    } catch (error) {
        console.error('Error fetching stream details:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Check if a specific user is live
const checkUserLiveStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const liveStream = await LiveStream.findOne({ hostId: userId, status: 'live' })
            .populate('hostId', 'name username avatar');

        res.status(200).json({
            success: true,
            isLive: !!liveStream,
            data: liveStream
        });
    } catch (error) {
        console.error('Error checking user live status:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    startStream,
    endStream,
    getActiveStreams,
    getStreamDetails,
    checkUserLiveStatus
};
