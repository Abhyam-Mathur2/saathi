const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  eventType: { type: String, enum: ['Donation', 'Medical Camp', 'Cleanup', 'Education', 'Other'] },
  date: { type: Date, required: true },
  location: { address: String, coordinates: [Number] },
  createdBy: String,
  targetAudience: { type: String, enum: ['volunteers', 'citizens', 'both'], default: 'both' },
  registeredVolunteers: [String],
  status: { type: String, enum: ['Upcoming', 'Active', 'Completed'], default: 'Upcoming' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);