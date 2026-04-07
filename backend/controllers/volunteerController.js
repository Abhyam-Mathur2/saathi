const Volunteer = require('../models/Volunteer');
const localStore = require('../services/localStore');

const normalize = (value) => String(value || '').trim().toLowerCase();

const deriveGeoText = (volunteer) => normalize(volunteer.city || volunteer.state || volunteer.location?.address);

const matchesScope = (item, scope = {}) => {
    const scopeOrganization = String(scope.organizationId || '').trim();
    const scopeCity = normalize(scope.city);
    const scopeState = normalize(scope.state);
    const scopeCountry = normalize(scope.country);

    if (scopeOrganization) {
        return String(item.organization || '') === scopeOrganization;
    }

    const itemGeoText = deriveGeoText(item);

    if (scopeCity && itemGeoText.includes(scopeCity)) {
        return true;
    }

    if (scopeState && itemGeoText.includes(scopeState)) {
        return true;
    }

    if (scopeCountry && normalize(item.country || 'India').includes(scopeCountry)) {
        return true;
    }

    if (!scopeCity && !scopeState && !scopeCountry && !scopeOrganization) {
        return true;
    }

    return false;
};

exports.registerVolunteer = async (req, res) => {
    try {
        const volunteerData = {
            ...req.body,
            organization: req.body.organization || null,
            city: req.body.city || (String(req.body.location?.address || '').split(',')[0] || '').trim(),
            state: req.body.state || (String(req.body.location?.address || '').split(',')[1] || '').trim(),
            country: req.body.country || 'India',
            role: req.body.role || 'volunteer',
            isActive: req.body.isActive !== false,
        };

        const volunteer = await localStore.createVolunteer(volunteerData, Volunteer);
        res.status(201).json({ success: true, message: 'Volunteer registered', data: volunteer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getVolunteers = async (req, res) => {
    try {
        const volunteers = await localStore.listVolunteers(Volunteer);
        const scopedVolunteers = volunteers.filter((volunteer) => matchesScope(volunteer, req.query));

        // If latitude and longitude provided, filter by location
        const { latitude, longitude, radiusKm = 25 } = req.query;

        if (latitude && longitude) {
            const userLat = parseFloat(latitude);
            const userLon = parseFloat(longitude);
            const radius = parseFloat(radiusKm);

            if (isNaN(userLat) || isNaN(userLon) || isNaN(radius)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid location parameters'
                });
            }

            // Filter volunteers within radius
            const filteredVolunteers = scopedVolunteers.filter((volunteer) => {
                if (!volunteer.location || !volunteer.location.coordinates || volunteer.location.coordinates.length < 2) {
                    return false;
                }

                const [volLon, volLat] = volunteer.location.coordinates;
                const distance = calculateDistance(
                    [userLon, userLat],
                    [volLon, volLat]
                );

                return distance <= radius;
            });

            return res.status(200).json({
                success: true,
                data: filteredVolunteers,
                meta: {
                    total: volunteers.length,
                    nearby: filteredVolunteers.length,
                    radiusKm: radius,
                    userLocation: { latitude: userLat, longitude: userLon }
                }
            });
        }

        // Return all volunteers if no location filter
        res.status(200).json({ success: true, data: scopedVolunteers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Calculate distance between two coordinates in kilometers
 * Haversine formula
 */
const calculateDistance = (coord1, coord2) => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const toRad = (value) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
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
