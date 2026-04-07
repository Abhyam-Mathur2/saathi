const Report = require('../models/Report');
const mongoose = require('mongoose');
const groqService = require('../services/groqService');
const matchingEngine = require('../services/matchingEngine');
const Volunteer = require('../models/Volunteer');
const Assignment = require('../models/Assignment');
const Organization = require('../models/Organization');
const { getDistanceInKm } = require('../services/matchingEngine');
const { logActivity } = require('./activityController');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds a MongoDB query that returns reports visible to an admin:
 * Their org's city + nearby cities within serviceRadiusKm.
 */
async function buildAdminReportQuery(orgId, extraFilters = {}) {
    const org = await Organization.findById(orgId).lean();
    if (!org) return { organization: orgId, ...extraFilters };

    // Find all org locations within service radius using Atlas geospatial
    // Fallback: just match by city/state
    const query = {
        $or: [
            { organization: org._id },
            { city: { $regex: new RegExp(org.city, 'i') } }
        ],
        ...extraFilters
    };
    return query;
}

// ─── Create Report ────────────────────────────────────────────────────────────

exports.createReport = async (req, res) => {
    try {
        let reportData = req.body;

        if (req.body.isUnstructured && req.body.text) {
            const aiData = await groqService.parseUnstructuredText(req.body.text);
            reportData = { ...reportData, ...aiData };
        } else {
            if (!reportData.description?.trim())
                return res.status(400).json({ success: false, message: 'Description is required' });
            if (!reportData.issueType)
                return res.status(400).json({ success: false, message: 'Issue type is required' });
            if (!reportData.location?.coordinates || !reportData.location?.address)
                return res.status(400).json({ success: false, message: 'Location with coordinates and address is required' });
            reportData.location.coordinates = reportData.location.coordinates.map(Number);
            if (reportData.location.coordinates.some(isNaN))
                return res.status(400).json({ success: false, message: 'Invalid coordinates' });
        }

        const report = new Report(reportData);
        await report.save();

        res.status(201).json({ success: true, message: 'Report created successfully', data: report.toObject() });
    } catch (error) {
        console.error('Report Creation Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Get Reports (org-scoped) ─────────────────────────────────────────────────

exports.getReports = async (req, res) => {
    try {
        const { orgId, city, status, volunteerId } = req.query;
        let query = {};

        if (volunteerId) {
            // Volunteer sees reports assigned to them
            const assignments = await Assignment.find({ volunteer: volunteerId }).select('report').lean();
            const reportIds = assignments.map(a => a.report);
            query = { _id: { $in: reportIds } };
        } else if (orgId) {
            // Admin sees their city's reports + reports filed to their org
            query = await buildAdminReportQuery(orgId);
        } else if (city) {
            query = { city: { $regex: new RegExp(city, 'i') } };
        }

        if (status) query.status = status;

        const reports = await Report.find(query)
            .populate('submittedBy', 'name username city')
            .populate('organization', 'name city')
            .populate('assignedVolunteers', 'name phone city')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        console.error('getReports error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Get Single Report ─────────────────────────────────────────────────────────

exports.getReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId)
            .populate('submittedBy', 'name username city phone')
            .populate('organization', 'name city')
            .populate('assignedVolunteers', 'name phone city skills')
            .lean();
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Get Matches for Report ────────────────────────────────────────────────────

exports.getMatchesForReport = async (req, res) => {
    try {
        const { orgId } = req.query;
        const report = await Report.findById(req.params.reportId).lean();
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        // Build volunteer pool: org volunteers + independent volunteers in the city
        let volQuery = { status: 'Active' };
        if (orgId) {
            const org = await Organization.findById(orgId).lean();
            volQuery = {
                status: 'Active',
                $or: [
                    { organization: orgId },
                    { organization: null, city: { $regex: new RegExp(org?.city || '', 'i') } }
                ]
            };
        }

        const volunteers = await Volunteer.find(volQuery).populate('organization', 'name').lean();
        const matches = matchingEngine.calculateMatches(report, volunteers);

        res.status(200).json({ success: true, data: matches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Assign Volunteer to Report ────────────────────────────────────────────────

exports.assignVolunteer = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { volunteerId, adminId, orgId, notes } = req.body;

        const report = await Report.findById(reportId);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        const volunteer = await Volunteer.findById(volunteerId);
        if (!volunteer) return res.status(404).json({ success: false, message: 'Volunteer not found' });

        // Create assignment
        let assignment = await Assignment.findOne({ report: reportId, volunteer: volunteerId });
        if (!assignment) {
            assignment = new Assignment({
                report: reportId,
                volunteer: volunteerId,
                assignedBy: adminId || null,
                organization: orgId || report.organization || null,
                status: 'Pending',
                notes: notes || ''
            });
        } else {
            assignment.status = 'Pending';
            assignment.assignedAt = new Date();
        }
        await assignment.save();

        // Update report
        if (!report.assignedVolunteers.map(v => v.toString()).includes(volunteerId)) {
            report.assignedVolunteers.push(volunteerId);
        }
        report.status = 'Assigned';
        if (orgId) report.organization = orgId;
        await report.save();

        // Log activity
        await logActivity({
            volunteerId,
            volunteerName: volunteer.name,
            type: 'TASK_ASSIGNED',
            title: 'New Task Assigned',
            description: report.description,
            meta: {
                reportId,
                reportTitle: report.description?.slice(0, 50),
                issueType: report.issueType,
                urgency: report.urgency,
                location: report.location?.address
            }
        });

        res.status(200).json({ success: true, message: 'Volunteer assigned successfully', data: assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Decline Task & Auto Reassign ──────────────────────────────────────────

exports.declineTask = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { volunteerId } = req.body;

        const report = await Report.findById(reportId);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        const volunteer = await Volunteer.findById(volunteerId);
        const assignedVolunteers = Array.isArray(report.assignedVolunteers) ? report.assignedVolunteers.map(v => v.toString()) : [];

        // Remove assignment
        await Assignment.findOneAndDelete({ report: reportId, volunteer: volunteerId });

        // Remove volunteer from report array
        report.assignedVolunteers = assignedVolunteers.filter(v => v !== volunteerId);

        // If nobody is left on the report, reassign to the next best eligible volunteer.
        if (report.assignedVolunteers.length === 0) {
            const excludeIds = [volunteerId];
            const orgFilter = report.organization ? { organization: report.organization } : {};
            const cityFilter = report.city ? { city: { $regex: new RegExp(report.city, 'i') } } : {};

            const candidates = await Volunteer.find({
                status: 'Active',
                _id: { $nin: excludeIds },
                ...orgFilter,
                ...(report.organization ? {} : cityFilter)
            }).populate('organization', 'name').lean();

            const matches = matchingEngine.calculateMatches(report, candidates);
            const nextBest = matches[0]?.volunteer;

            if (nextBest) {
                const newAssignment = new Assignment({
                    report: report._id,
                    volunteer: nextBest._id,
                    assignedBy: null,
                    organization: report.organization || nextBest.organization?._id || nextBest.organization || null,
                    status: 'Pending',
                    notes: 'Auto-assigned after decline'
                });
                await newAssignment.save();
                report.assignedVolunteers = [nextBest._id];
                report.status = 'Assigned';
            } else {
                report.status = 'Pending';
            }
        }
        await report.save();

        // Log activity
        await logActivity({
            volunteerId,
            volunteerName: volunteer?.name,
            type: 'TASK_DECLINED',
            title: 'Task Declined',
            description: report.description,
            meta: {
                reportId,
                reportTitle: report.description?.slice(0, 50),
                issueType: report.issueType
            }
        });

        // Trigger Auto Planner in background asynchronously on the same organization scope
        const autoPlannerService = require('../services/autoPlanner');
        autoPlannerService.runAutoPlanner(report.organization).catch(e => console.error('AutoPlanner err after decline:', e));

        res.status(200).json({ success: true, message: 'Task gracefully declined and re-routed to Assignment Engine.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Update Report Status ──────────────────────────────────────────────────────

exports.updateReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const update = req.body;
        const report = await Report.findByIdAndUpdate(reportId, update, { new: true }).lean();
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Complete Report ───────────────────────────────────────────────────────────

exports.completeReport = async (req, res) => {
    try {
        const { completionPhoto, note } = req.body;
        const report = await Report.findById(req.params.reportId);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        report.status = 'Resolved';
        report.completionPhoto = completionPhoto;
        report.completionNote = note;
        report.resolvedAt = new Date();
        await report.save();

        // Log activity for each assigned volunteer who completed it
        if (report.assignedVolunteers && report.assignedVolunteers.length > 0) {
            for (const vId of report.assignedVolunteers) {
                const vol = await Volunteer.findById(vId);
                await logActivity({
                    volunteerId: vId.toString(),
                    volunteerName: vol?.name,
                    type: 'TASK_COMPLETED',
                    title: 'Task Completed ✓',
                    description: report.description,
                    meta: {
                        reportId: report._id.toString(),
                        reportTitle: report.description?.slice(0, 50),
                        issueType: report.issueType,
                        completionPhoto
                    }
                });
            }
        }

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Generate Tweet ───────────────────────────────────────────────────────────

exports.generateTweet = async (req, res) => {
    try {
        const { reportId } = req.params;
        const reportFromBody = req.body?.report;

        let report = null;
        if (reportId && mongoose.Types.ObjectId.isValid(reportId) && process.env.MONGODB_URI) {
            report = await Report.findById(reportId).lean();
        }

        // Fallback for local/demo reports used by tracking UI
        if (!report && reportFromBody && typeof reportFromBody === 'object') {
            report = {
                ...reportFromBody,
                createdAt: reportFromBody.createdAt || new Date().toISOString(),
                location: reportFromBody.location || {
                    address: reportFromBody.address || 'Not specified',
                    coordinates: [77.1025, 28.7041]
                },
                address: reportFromBody.address || reportFromBody.location?.address || 'Not specified',
                issueType: reportFromBody.issueType || 'Other',
                urgency: Number(reportFromBody.urgency) || 5,
                description: reportFromBody.description || 'Community issue reported.'
            };
        }

        if (!report) return res.status(404).json({ success: false, message: 'Report not found for tweet generation.' });

        // Build the tweet using Groq
        const tweet = await groqService.generateCivicTweet(report);
        res.status(200).json({ success: true, data: { tweet } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Citizen's Own Reports ─────────────────────────────────────────────────────

exports.getCitizenReports = async (req, res) => {
    try {
        const { citizenId } = req.params;
        const reports = await Report.find({ submittedBy: citizenId })
            .populate('organization', 'name city')
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Analyze Image (OCR fallback) ─────────────────────────────────────────────

exports.analyzeImage = async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        const analysis = await groqService.analyzeReportImage?.(imageBase64) || { description: 'Image analysis unavailable.' };
        res.status(200).json({ success: true, data: analysis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
