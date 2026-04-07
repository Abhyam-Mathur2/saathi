const Organization = require('../models/Organization');
const { getDistanceInKm } = require('../services/matchingEngine');

// GET /api/orgs — list all active organizations, optional ?city= filter
exports.listOrgs = async (req, res) => {
    try {
        const { city, lat, lng, radius } = req.query;
        let query = { isActive: true };
        if (city) {
            query.city = { $regex: new RegExp(city, 'i') };
        }

        let orgs = await Organization.find(query).lean();

        // If lat/lng and radius provided, filter by proximity
        if (lat && lng && radius) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            const maxKm = parseFloat(radius) || 100;
            orgs = orgs.filter(org => {
                if (!org.location?.coordinates?.length) return false;
                const [oLng, oLat] = org.location.coordinates;
                const d = getDistanceInKm([userLng, userLat], [oLng, oLat]);
                org.distanceKm = parseFloat(d.toFixed(1));
                return d <= maxKm;
            });
            orgs.sort((a, b) => a.distanceKm - b.distanceKm);
        }

        return res.status(200).json({ success: true, data: orgs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/orgs/:id — single org detail
exports.getOrg = async (req, res) => {
    try {
        const org = await Organization.findById(req.params.id).lean();
        if (!org) return res.status(404).json({ success: false, message: 'Organization not found.' });
        return res.status(200).json({ success: true, data: org });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/orgs/city/:cityName — all orgs in a specific city
exports.getOrgsByCity = async (req, res) => {
    try {
        const orgs = await Organization.find({
            city: { $regex: new RegExp(req.params.cityName, 'i') },
            isActive: true
        }).lean();
        return res.status(200).json({ success: true, data: orgs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/orgs — create a new organization dynamically
exports.createOrg = async (req, res) => {
    try {
        const { name, city, description } = req.body;
        if (!name || !city) {
            return res.status(400).json({ success: false, message: 'Name and city are required' });
        }
        
        // Use a generic placeholder location if none provided (could be upgraded to geocode)
        const newOrg = new Organization({
            name,
            city,
            description: description || 'Newly registered NGO.',
            isActive: true,
            location: {
                type: 'Point',
                coordinates: [77.1025, 28.7041], // Safe fallback (Delhi)
                address: city
            }
        });

        await newOrg.save();
        res.status(201).json({ success: true, data: newOrg });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
