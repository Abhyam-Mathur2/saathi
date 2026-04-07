const Assignment = require('../models/Assignment');
const Report = require('../models/Report');
const Volunteer = require('../models/Volunteer');
const Organization = require('../models/Organization');

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const sameScope = (report, volunteer) => {
    const reportOrg = String(report.organization || '').trim();
    const volunteerOrg = String(volunteer.organization || '').trim();
    if (reportOrg && volunteerOrg) {
        return reportOrg === volunteerOrg;
    }

    const reportCity = normalizeText(report.city || report.location?.address);
    const volunteerCity = normalizeText(volunteer.city || volunteer.location?.address);
    if (reportCity && volunteerCity) {
        return reportCity.includes(volunteerCity) || volunteerCity.includes(reportCity);
    }

    return true;
};

exports.createAssignment = async (req, res) => {
    try {
        const { reportId, volunteerId, assignedBy, organizationId, note = '' } = req.body;

        if (!reportId || !volunteerId) {
            return res.status(400).json({ success: false, message: 'reportId and volunteerId are required.' });
        }

        const [report, volunteer] = await Promise.all([
            Report.findById(reportId),
            Volunteer.findById(volunteerId),
        ]);

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found.' });
        }

        if (!volunteer) {
            return res.status(404).json({ success: false, message: 'Volunteer not found.' });
        }

        const reportOrg = String(report.organization || '');
        const volunteerOrg = String(volunteer.organization || '');
        const requestedOrg = String(organizationId || '').trim();

        if (requestedOrg) {
            const org = await Organization.findById(requestedOrg);
            if (!org) {
                return res.status(404).json({ success: false, message: 'Organization not found.' });
            }
            if (report.organization && String(report.organization) !== requestedOrg) {
                return res.status(400).json({ success: false, message: 'Report does not belong to this organization.' });
            }
            if (volunteer.organization && String(volunteer.organization) !== requestedOrg) {
                return res.status(400).json({ success: false, message: 'Volunteer does not belong to this organization.' });
            }
        }

        if (reportOrg && volunteerOrg && reportOrg !== volunteerOrg) {
            return res.status(400).json({ success: false, message: 'Volunteer can only receive tasks from the same organization.' });
        }

        if (!sameScope(report, volunteer)) {
            return res.status(400).json({ success: false, message: 'Volunteer and report must be in the same city or organization scope.' });
        }

        const assignment = await Assignment.create({
            report: reportId,
            volunteer: volunteerId,
            organization: organizationId || report.organization || volunteer.organization || null,
            assignedBy: assignedBy || null,
            note,
            status: 'Assigned',
        });

        await Report.findByIdAndUpdate(reportId, {
            status: 'Assigned',
            assignedVolunteers: Array.from(new Set([...(report.assignedVolunteers || []).map(String), volunteerId])),
        });

        return res.status(201).json({ success: true, message: 'Assignment created successfully.', data: assignment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAssignments = async (req, res) => {
    try {
        const { volunteerId, organizationId, reportId, status } = req.query;
        const filter = {};

        if (volunteerId) {
            filter.volunteer = volunteerId;
        }
        if (organizationId) {
            filter.organization = organizationId;
        }
        if (reportId) {
            filter.report = reportId;
        }
        if (status) {
            filter.status = status;
        }

        const query = Assignment.find(filter)
            .populate('report')
            .populate('volunteer')
            .sort({ assignedAt: -1 })
            .lean();
        
        // Set timeout to prevent indefinite buffering
        const assignments = await query.timeout({ serverSelectionTimeoutMS: 5000 });

        return res.status(200).json({ success: true, data: assignments });
    } catch (error) {
        if (error.message && error.message.includes('timeout')) {
            return res.status(503).json({ 
                success: false, 
                message: 'Database temporarily unavailable. Please try again.',
                data: []
            });
        }
        return res.status(500).json({ success: false, message: error.message || 'Internal server error', data: [] });
    }
};

exports.respondToAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, responseNote = '' } = req.body;

        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found.' });
        }

        if (action === 'accept') {
            assignment.status = 'Confirmed';
            assignment.acceptedAt = new Date();
        } else if (action === 'decline') {
            assignment.status = 'Cancelled';
            assignment.declinedAt = new Date();
        } else {
            return res.status(400).json({ success: false, message: 'Action must be accept or decline.' });
        }

        assignment.responseNote = responseNote;
        await assignment.save();

        if (assignment.status === 'Confirmed') {
            await Report.findByIdAndUpdate(assignment.report, { status: 'Assigned' });
        }

        return res.status(200).json({ success: true, message: `Assignment ${action}ed successfully.`, data: assignment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
