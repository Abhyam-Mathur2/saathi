const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  volunteerId: { type: String, required: true, index: true },
  volunteerName: { type: String },
  type: {
    type: String,
    required: true,
    enum: [
      'TASK_ASSIGNED',
      'TASK_ACCEPTED',
      'TASK_DECLINED',
      'TASK_COMPLETED',
      'REPORT_SUBMITTED',
      'AVAILABILITY_ON',
      'AVAILABILITY_OFF',
      'ROLE_SWITCHED_CITIZEN',
      'ROLE_SWITCHED_VOLUNTEER',
      'PING_SENT',
      'PING_RECEIVED',
      'JOINED',
      'EVENT_REGISTERED',
      'BADGE_EARNED'
    ]
  },
  title: { type: String, required: true },          // Short action title e.g. "Task Completed"
  description: { type: String },                    // Longer detail e.g. "Resolved pothole at MG Road"
  meta: {                                           // Flexible extra data per type
    reportId: String,
    reportTitle: String,
    issueType: String,
    urgency: Number,
    location: String,
    completionPhoto: String,
    targetVolunteerId: String,
    targetVolunteerName: String,
    eventId: String,
    eventTitle: String,
    badgeName: String,
    badgeIcon: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);
