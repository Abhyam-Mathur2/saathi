const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET /api/community/:city
// Retrieve last 50 messages for the volunteer's city
router.get('/:city', async (req, res) => {
    try {
        const city = req.params.city;
        const messages = await Message.find({ city: { $regex: new RegExp(`^${city}$`, 'i') } })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        res.status(200).json({ success: true, data: messages.reverse() });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/community
// Add a new message to the local forum
router.post('/', async (req, res) => {
    try {
        const { city, senderId, senderName, content } = req.body;
        if (!city || !senderId || !senderName || !content) {
            return res.status(400).json({ success: false, message: 'All fields required' });
        }
        
        const newMessage = new Message({ city, senderId, senderName, content });
        await newMessage.save();
        res.status(201).json({ success: true, data: newMessage });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
