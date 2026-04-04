const Report = require('../models/Report');
const Volunteer = require('../models/Volunteer');
const Assignment = require('../models/Assignment');
const localStore = require('../services/localStore');

exports.getStats = async (req, res) => {
    try {
        const totalReports = await localStore.countReports({}, Report);
        const urgentReports = await localStore.countReports({ urgency: { $gte: 8 } }, Report);
        const totalVolunteers = await localStore.countVolunteers(Volunteer);
        const totalAssignments = await localStore.countAssignments(Assignment);
        const categories = await localStore.aggregateReportCategories(Report);
        const reportsTrend = await localStore.aggregateReportTrend(Report);
        const topUrgent = await localStore.getTopUrgentReports(Report, 5);

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalReports,
                    urgentReports,
                    totalVolunteers,
                    totalAssignments
                },
                categories,
                reportsTrend,
                topUrgent
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
