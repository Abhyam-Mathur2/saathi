const Volunteer = require('../models/Volunteer');
const localStore = require('../services/localStore');

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
