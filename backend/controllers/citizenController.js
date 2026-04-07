const localStore = require('../services/localStore');
const Report = require('../models/Report');
const Organization = require('../models/Organization');

const normalize = (value) => String(value || '').trim().toLowerCase();

exports.registerCitizen = async (req, res) => {
    try {
        const { name, phone, email = '', city, state = '', country = 'India', location, preferredOrganization } = req.body;

        if (!name || !phone || !city) {
            return res.status(400).json({ success: false, message: 'name, phone, and city are required.' });
        }

        const citizen = await localStore.createCitizen({
            name: String(name).trim(),
            phone: String(phone).trim(),
            email: String(email).trim().toLowerCase(),
            city: String(city).trim(),
            state: String(state).trim(),
            country: String(country).trim() || 'India',
            location: location || { type: 'Point', coordinates: [77.1025, 28.7041], address: `${city}, ${state || 'India'}` },
            preferredOrganization: preferredOrganization || null,
        });

        return res.status(201).json({ success: true, message: 'Citizen created successfully.', data: citizen });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCitizens = async (req, res) => {
    try {
        const citizens = await localStore.listCitizens();
        const { city, state } = req.query;

        let filtered = citizens;
        if (city) {
            const cityValue = normalize(city);
            filtered = filtered.filter((citizen) => normalize(citizen.city).includes(cityValue));
        }
        if (state) {
            const stateValue = normalize(state);
            filtered = filtered.filter((citizen) => normalize(citizen.state).includes(stateValue));
        }

        return res.status(200).json({ success: true, data: filtered });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getNearbyOrganizations = async (req, res) => {
    try {
        const { city, state } = req.query;
        const organizations = await localStore.listOrganizations();

        let filtered = organizations;
        if (city) {
            const cityValue = normalize(city);
            filtered = filtered.filter((org) => normalize(org.city).includes(cityValue));
        }
        if (state) {
            const stateValue = normalize(state);
            filtered = filtered.filter((org) => normalize(org.state).includes(stateValue));
        }

        return res.status(200).json({ success: true, data: filtered });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyReports = async (req, res) => {
    try {
        const { citizenId, phone, city } = req.query;
        const reports = await localStore.listReports(Report);

        const filtered = reports.filter((report) => {
            if (citizenId && String(report.citizen || '') === String(citizenId)) {
                return true;
            }
            if (phone && normalize(report.reporterPhone) === normalize(phone)) {
                return true;
            }
            if (city && normalize(report.city).includes(normalize(city))) {
                return true;
            }
            return false;
        });

        return res.status(200).json({ success: true, data: filtered });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
