const Report = require('../models/Report');
const Volunteer = require('../models/Volunteer');
const Assignment = require('../models/Assignment');
const Organization = require('../models/Organization');

exports.getStats = async (req, res) => {
    try {
        const { orgId, city } = req.query;
        let reportQuery = {};
        let volunteerQuery = {};

        if (orgId) {
            const org = await Organization.findById(orgId).lean();
            if (org) {
                // Reports: owned by this org OR in their city
                reportQuery = {
                    $or: [
                        { organization: org._id },
                        { city: { $regex: new RegExp(org.city, 'i') } }
                    ]
                };
                // Volunteers: org volunteers + independent in city
                volunteerQuery = {
                    $or: [
                        { organization: org._id },
                        { organization: null, city: { $regex: new RegExp(org.city, 'i') } }
                    ]
                };
            }
        } else if (city) {
            reportQuery = { city: { $regex: new RegExp(city, 'i') } };
            volunteerQuery = { city: { $regex: new RegExp(city, 'i') } };
        }

        const [totalReports, urgentReports, totalVolunteers, totalAssignments] = await Promise.all([
            Report.countDocuments(reportQuery),
            Report.countDocuments({ ...reportQuery, urgency: { $gte: 8 } }),
            Volunteer.countDocuments(volunteerQuery),
            Assignment.countDocuments({ organization: orgId || undefined })
        ]);

        // Category breakdown
        const categories = await Report.aggregate([
            { $match: reportQuery },
            { $group: { _id: '$issueType', count: { $sum: 1 } } }
        ]);

        // Trend — last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const reportsTrend = await Report.aggregate([
            { $match: { ...reportQuery, createdAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Status breakdown
        const statusBreakdown = await Report.aggregate([
            { $match: reportQuery },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Top urgent pending reports
        const topUrgent = await Report.find({ ...reportQuery, status: { $in: ['Pending', 'Assigned'] } })
            .sort({ urgency: -1 })
            .limit(5)
            .lean();

        // Volunteer work leaderboard (for admin)
        const workLeaderboard = await Volunteer.find(volunteerQuery)
            .sort({ completedTasks: -1 })
            .limit(5)
            .select('name completedTasks city organization')
            .populate('organization', 'name')
            .lean();

        res.status(200).json({
            success: true,
            data: {
                summary: { totalReports, urgentReports, totalVolunteers, totalAssignments },
                categories,
                reportsTrend,
                statusBreakdown,
                topUrgent,
                workLeaderboard
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
