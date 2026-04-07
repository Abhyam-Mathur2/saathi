const Activity = require('../models/Activity');
const Volunteer = require('../models/Volunteer');
const localStore = require('../utils/localStore');

// Log a new activity — called internally from other controllers
exports.logActivity = async (entry) => {
  try {
    if (process.env.MONGODB_URI) {
      const act = new Activity(entry);
      await act.save();
      return act;
    } else {
      return localStore.addActivity(entry);
    }
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

// POST /api/activity/ping
exports.logPing = async (req, res) => {
  try {
    const { senderId, senderName, targetVolunteerIds, reportId } = req.body;
    
    // Log PING_SENT for sender
    await exports.logActivity({
      volunteerId: senderId,
      volunteerName: senderName,
      type: 'PING_SENT',
      title: 'Sent Help Request',
      description: `Requested backup for a task`,
      meta: { reportId }
    });

    // Log PING_RECEIVED for each target
    if (targetVolunteerIds && Array.isArray(targetVolunteerIds)) {
      for (const targetId of targetVolunteerIds) {
        let targetName = 'Another Volunteer';
        if (process.env.MONGODB_URI) {
          const targetVol = await Volunteer.findById(targetId);
          targetName = targetVol?.name || targetName;
        }
        
        await exports.logActivity({
          volunteerId: targetId,
          volunteerName: targetName,
          type: 'PING_RECEIVED',
          title: 'Received Help Request',
          description: `Volunteer ${senderName} requested backup`,
          meta: { 
            reportId, 
            targetVolunteerId: senderId, 
            targetVolunteerName: senderName 
          }
        });
      }
    }

    res.status(200).json({ success: true, message: 'Ping activities logged' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/activity/volunteer/:volunteerId?limit=50
exports.getVolunteerActivity = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    let activities;
    if (process.env.MONGODB_URI) {
      activities = await Activity.find({ volunteerId })
        .sort({ createdAt: -1 }).limit(limit).lean();
    } else {
      activities = localStore.getActivitiesByVolunteer(volunteerId, limit);
    }
    res.status(200).json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/activity/recent?limit=100
exports.getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    let activities;
    if (process.env.MONGODB_URI) {
      activities = await Activity.find().sort({ createdAt: -1 }).limit(limit).lean();
    } else {
      activities = localStore.getRecentActivities(limit);
    }
    res.status(200).json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
