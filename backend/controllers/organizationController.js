const localStore = require('../services/localStore');

const normalize = (value) => String(value || '').trim().toLowerCase();

exports.createOrganization = async (req, res) => {
    try {
        const { name, slug, city, state, country = 'India', address = '', location, radiusKm = 25, active = true } = req.body;

        if (!name || !slug || !city || !state) {
            return res.status(400).json({ success: false, message: 'name, slug, city, and state are required.' });
        }

        const organization = await localStore.createOrganization({
            name: String(name).trim(),
            slug: String(slug).trim().toLowerCase(),
            city: String(city).trim(),
            state: String(state).trim(),
            country: String(country).trim() || 'India',
            address: String(address).trim(),
            location: location || { type: 'Point', coordinates: [77.1025, 28.7041], address: `${city}, ${state}` },
            radiusKm: Number(radiusKm) || 25,
            active: Boolean(active),
        });

        return res.status(201).json({ success: true, message: 'Organization created successfully.', data: organization });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOrganizations = async (req, res) => {
    try {
        const organizations = await localStore.listOrganizations();
        const { city, state, active } = req.query;

        let filtered = organizations;
        if (city) {
            const cityValue = normalize(city);
            filtered = filtered.filter((org) => normalize(org.city).includes(cityValue));
        }
        if (state) {
            const stateValue = normalize(state);
            filtered = filtered.filter((org) => normalize(org.state).includes(stateValue));
        }
        if (active !== undefined) {
            const activeValue = String(active).toLowerCase() === 'true';
            filtered = filtered.filter((org) => Boolean(org.active) === activeValue);
        }

        return res.status(200).json({ success: true, data: filtered });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
