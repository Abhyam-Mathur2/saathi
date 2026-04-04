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
