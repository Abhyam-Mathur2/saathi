const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    city: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', required: true },
    senderName: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

MessageSchema.index({ city: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
