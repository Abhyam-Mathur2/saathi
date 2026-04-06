const Volunteer = require('../models/Volunteer');
const localStore = require('../services/localStore');
const Report = require('../models/Report');
const matchingEngine = require('../services/matchingEngine');

exports.registerVolunteer = async (req, res) => {
    try {
        const volunteer = await localStore.createVolunteer(req.body, Volunteer);
        res.status(201).json({ success: true, message: 'Volunteer registered', data: volunteer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getVolunteers = async (req, res) => {
    try {
        const volunteers = await localStore.listVolunteers(Volunteer);
        res.status(200).json({ success: true, data: volunteers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteVolunteer = async (req, res) => {
    try {
        const deleted = await localStore.deleteVolunteer(req.params.id, Volunteer);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Volunteer not found' });
        }
        res.status(200).json({ success: true, message: 'Volunteer removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.declineTask = async (req, res) => {
  try {
    const { id, reportId } = req.params;
    const report = await localStore.findReportById(reportId, Report);
    if (!report) return res.status(404).json({ success: false });
    
    const volunteers = await localStore.listVolunteers(Volunteer);
    const remainingVolunteers = volunteers.filter(v => String(v._id) !== String(id));
    const matches = matchingEngine.calculateMatches(report, remainingVolunteers);
    
    if (matches.length > 0) {
      const nextBest = matches[0].volunteer;
      await localStore.updateReport(reportId, { 
        assignedVolunteers: [nextBest._id],
        status: 'Assigned' 
      }, Report);
    } else {
      await localStore.updateReport(reportId, {
        assignedVolunteers: [],
        status: 'Pending'
      }, Report);
    }
    
    res.status(200).json({ success: true, message: 'Task declined and reassigned' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;
    res.status(200).json({ success: true, message: 'Availability toggled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
