const Volunteer = require('../models/Volunteer');
const Assignment = require('../models/Assignment');
const Report = require('../models/Report');
const Organization = require('../models/Organization');
const matchingEngine = require('../services/matchingEngine');
const { logActivity } = require('./activityController');

// ─── Register Volunteer ───────────────────────────────────────────────────────

exports.registerVolunteer = async (req, res) => {
    try {
        const volunteer = new Volunteer(req.body);
        await volunteer.save();
        res.status(201).json({ success: true, message: 'Volunteer registered', data: volunteer.toObject() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Get Volunteers (org-scoped) ──────────────────────────────────────────────

exports.getVolunteers = async (req, res) => {
    try {
        const { orgId, city } = req.query;
        let query = {};

        if (orgId) {
            const org = await Organization.findById(orgId).lean();
            // Return org's volunteers + independent volunteers in their city
            query = {
                $or: [
                    { organization: orgId },
                    { organization: null }
                ]
            };
            if (org?.city) {
                query.$or[1].city = { $regex: new RegExp(org.city, 'i') };
            }
        } else if (city) {
            query = { city: { $regex: new RegExp(city, 'i') } };
        }

        const volunteers = await Volunteer.find(query)
            .populate('organization', 'name city')
            .lean();

        res.status(200).json({ success: true, data: volunteers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Delete Volunteer ─────────────────────────────────────────────────────────

exports.deleteVolunteer = async (req, res) => {
    try {
        const deleted = await Volunteer.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Volunteer not found' });
        res.status(200).json({ success: true, message: 'Volunteer removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Get Volunteer Assignments ─────────────────────────────────────────────────

exports.getVolunteerAssignments = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.query;

        const query = { volunteer: id };
        if (status) query.status = status;

        const assignments = await Assignment.find(query)
            .populate({
                path: 'report',
                populate: { path: 'organization', select: 'name city' }
            })
            .populate('assignedBy', 'name email')
            .sort({ assignedAt: -1 })
            .lean();

        res.status(200).json({ success: true, data: assignments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Accept Assignment ─────────────────────────────────────────────────────────

exports.acceptAssignment = async (req, res) => {
    try {
        const { id, assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
        if (assignment.volunteer.toString() !== id)
            return res.status(403).json({ success: false, message: 'Not your assignment' });

        assignment.status = 'Accepted';
        assignment.acceptedAt = new Date();
        await assignment.save();

        // Update report status
        await Report.findByIdAndUpdate(assignment.report, { status: 'In Progress' });

        res.status(200).json({ success: true, message: 'Assignment accepted', data: assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Decline Assignment ────────────────────────────────────────────────────────

exports.declineAssignment = async (req, res) => {
    try {
        const { id, assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId).populate('report');
        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
        if (assignment.volunteer.toString() !== id)
            return res.status(403).json({ success: false, message: 'Not your assignment' });

        assignment.status = 'Declined';
        assignment.declinedAt = new Date();
        await assignment.save();

        // Try to auto-reassign to next best volunteer
        const report = assignment.report;
        const declinedIds = (await Assignment.find({ report: report._id, status: 'Declined' })).map(a => a.volunteer.toString());

        const volunteers = await Volunteer.find({
            _id: { $nin: declinedIds },
            status: 'Active'
        }).lean();

        if (volunteers.length > 0) {
            const matches = matchingEngine.calculateMatches(report, volunteers);
            if (matches.length > 0) {
                const nextVol = matches[0].volunteer;
                const newAssignment = new Assignment({
                    report: report._id,
                    volunteer: nextVol._id,
                    organization: assignment.organization,
                    status: 'Pending'
                });
                await newAssignment.save();

                await Report.findByIdAndUpdate(report._id, {
                    assignedVolunteers: [nextVol._id],
                    status: 'Assigned'
                });
            } else {
                await Report.findByIdAndUpdate(report._id, { status: 'Pending', assignedVolunteers: [] });
            }
        } else {
            await Report.findByIdAndUpdate(report._id, { status: 'Pending', assignedVolunteers: [] });
        }

        res.status(200).json({ success: true, message: 'Task declined, auto-reassigning...' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Complete Assignment ───────────────────────────────────────────────────────

exports.completeAssignment = async (req, res) => {
    try {
        const { id, assignmentId } = req.params;
        const { completionPhoto, completionNote } = req.body;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
        if (assignment.volunteer.toString() !== id)
            return res.status(403).json({ success: false, message: 'Not your assignment' });

        assignment.status = 'Completed';
        assignment.completedAt = new Date();
        assignment.completionPhoto = completionPhoto || '';
        assignment.completionNote = completionNote || '';
        await assignment.save();

        // Update report as Resolved
        const report = await Report.findByIdAndUpdate(assignment.report, {
            status: 'Resolved',
            completionPhoto: completionPhoto || '',
            completionNote: completionNote || '',
            resolvedAt: new Date()
        });

        // Increment volunteer completed tasks
        const vol = await Volunteer.findByIdAndUpdate(id, { $inc: { completedTasks: 1 } }, { new: true });

        await logActivity({
            volunteerId: id,
            volunteerName: vol?.name,
            type: 'TASK_COMPLETED',
            title: 'Task Completed ✓',
            description: report?.description,
            meta: {
                reportId: assignment.report,
                reportTitle: report?.description?.slice(0, 50),
                issueType: report?.issueType,
                completionPhoto: completionPhoto || ''
            }
        });

        res.status(200).json({ success: true, message: 'Task completed!', data: assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Volunteer Work History (for admin) ───────────────────────────────────────

exports.getVolunteerWorkHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const assignments = await Assignment.find({ volunteer: id, status: 'Completed' })
            .populate('report', 'issueType description location city status resolvedAt')
            .sort({ completedAt: -1 })
            .lean();

        const volunteer = await Volunteer.findById(id).lean();

        res.status(200).json({
            success: true,
            data: {
                volunteer,
                completedAssignments: assignments,
                totalCompleted: assignments.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Toggle Availability ──────────────────────────────────────────────────────

exports.toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { available } = req.body;
        await Volunteer.findByIdAndUpdate(id, { isAvailable: available });
        res.status(200).json({ success: true, message: 'Availability updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
