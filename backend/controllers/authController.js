const Admin = require('../models/Admin');
const Volunteer = require('../models/Volunteer');
const Citizen = require('../models/Citizen');
const Organization = require('../models/Organization');

// ─── Admin Auth ──────────────────────────────────────────────────────────────

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email and password are required.' });

        const admin = await Admin.findOne({ email: email.trim().toLowerCase() }).populate('organization');
        if (!admin || admin.password !== password)
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        const org = admin.organization;
        return res.status(200).json({
            success: true,
            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: 'admin',
                orgId: org._id,
                orgName: org.name,
                city: org.city,
                state: org.state,
                serviceRadiusKm: org.serviceRadiusKm,
                orgLocation: org.location?.coordinates || null
            }
        });
    } catch (err) {
        console.error('adminLogin error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.adminRegister = async (req, res) => {
    try {
        const { name, email, password, orgId } = req.body;
        if (!name || !email || !password || !orgId)
            return res.status(400).json({ success: false, message: 'All fields are required.' });

        const exists = await Admin.findOne({ email: email.trim().toLowerCase() });
        if (exists)
            return res.status(409).json({ success: false, message: 'An admin with this email already exists.' });

        const org = await Organization.findById(orgId);
        if (!org)
            return res.status(404).json({ success: false, message: 'Organization not found.' });

        const admin = new Admin({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            organization: orgId,
            city: org.city,
            state: org.state
        });
        await admin.save();

        return res.status(201).json({
            success: true,
            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: 'admin',
                orgId: org._id,
                orgName: org.name,
                city: org.city
            }
        });
    } catch (err) {
        console.error('adminRegister error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Volunteer Auth ───────────────────────────────────────────────────────────

exports.volunteerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email and password are required.' });

        const volunteer = await Volunteer.findOne({ email: email.trim().toLowerCase() }).populate('organization');
        if (!volunteer || volunteer.password !== password)
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        const org = volunteer.organization;
        return res.status(200).json({
            success: true,
            data: {
                id: volunteer._id,
                name: volunteer.name,
                email: volunteer.email,
                phone: volunteer.phone,
                role: 'volunteer',
                orgId: org ? org._id : null,
                orgName: org ? org.name : null,
                city: volunteer.city,
                state: volunteer.state,
                skills: volunteer.skills
            }
        });
    } catch (err) {
        console.error('volunteerLogin error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.volunteerRegister = async (req, res) => {
    try {
        const { name, email, password, phone, orgId, skills, city, state, location, availability, profileImage } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'Name, email and password are required.' });

        const exists = await Volunteer.findOne({ email: email.trim().toLowerCase() });
        if (exists)
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' });

        let org = null;
        if (orgId) {
            org = await Organization.findById(orgId);
            if (!org)
                return res.status(404).json({ success: false, message: 'Organization not found.' });
        }

        // Build the location object cleanly
        let volunteerLocation;
        if (location && location.coordinates) {
            volunteerLocation = {
                type: 'Point',
                coordinates: location.coordinates,
                address: location.address || city || ''
            };
        } else if (org) {
            volunteerLocation = {
                type: 'Point',
                coordinates: org.location.coordinates,
                address: org.city
            };
        } else {
            // No explicit location supplied – use a safe default (city‑based if possible)
            const defaultCoords = city ? (city.toLowerCase().includes('chennai') ? [80.2707, 13.0827] : [77.1025, 28.7041]) : [0, 0];
            volunteerLocation = {
                type: 'Point',
                coordinates: defaultCoords,
                address: city || ''
            };
        }

        const volunteer = new Volunteer({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            phone: phone || '',
            organization: orgId || null,
            skills: skills || [],
            city: city || (org ? org.city : ''),
            state: state || (org ? org.state : ''),
            location: volunteerLocation,
            availability: availability || { days: [], times: [] },
            profileImage: profileImage || '',
            status: 'Active',
            isAvailable: true,
            completedTasks: 0
        });
        await volunteer.save();

        return res.status(201).json({
            success: true,
            data: {
                id: volunteer._id,
                name: volunteer.name,
                email: volunteer.email,
                phone: volunteer.phone,
                role: 'volunteer',
                orgId: org ? org._id : null,
                orgName: org ? org.name : null,
                city: volunteer.city
            }
        });
    } catch (err) {
        console.error('volunteerRegister error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};


// ─── Citizen Auth ─────────────────────────────────────────────────────────────

exports.citizenLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ success: false, message: 'Username and password are required.' });

        const citizen = await Citizen.findOne({ username: username.trim().toLowerCase() });
        if (!citizen || citizen.password !== password)
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });

        return res.status(200).json({
            success: true,
            data: {
                id: citizen._id,
                name: citizen.name,
                username: citizen.username,
                phone: citizen.phone,
                role: 'citizen',
                city: citizen.city,
                state: citizen.state
            }
        });
    } catch (err) {
        console.error('citizenLogin error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.citizenRegister = async (req, res) => {
    try {
        const { name, username, password, phone, city, state } = req.body;
        if (!name || !username || !password)
            return res.status(400).json({ success: false, message: 'Name, username, and password are required.' });

        const exists = await Citizen.findOne({ username: username.trim().toLowerCase() });
        if (exists)
            return res.status(409).json({ success: false, message: 'This username is already taken.' });

        const citizen = new Citizen({
            name: name.trim(),
            username: username.trim().toLowerCase(),
            password,
            phone: phone || '',
            city: city || '',
            state: state || ''
        });
        await citizen.save();

        return res.status(201).json({
            success: true,
            data: {
                id: citizen._id,
                name: citizen.name,
                username: citizen.username,
                phone: citizen.phone,
                role: 'citizen',
                city: citizen.city
            }
        });
    } catch (err) {
        console.error('citizenRegister error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
