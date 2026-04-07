const Report = require('../models/Report');
const Volunteer = require('../models/Volunteer');
const Assignment = require('../models/Assignment');
const localStore = require('../services/localStore');

const normalize = (value) => String(value || '').trim().toLowerCase();

const deriveGeoText = (item) => normalize(item.city || item.state || item.location?.address);

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

exports.getStats = async (req, res) => {
    try {
        const [reports, volunteers, assignments] = await Promise.all([
            localStore.listReports(Report),
            localStore.listVolunteers(Volunteer),
            localStore.listAssignments(Assignment),
        ]);

        const scopedReports = reports.filter((report) => matchesScope(report, req.query));
        const scopedVolunteers = volunteers.filter((volunteer) => matchesScope(volunteer, req.query));
        const totalAssignments = assignments.filter((assignment) => matchesScope(assignment, req.query)).length;

        const urgentReports = scopedReports.filter((report) => Number(report.urgency) >= 8).length;
        const totalReports = scopedReports.length;
        const totalVolunteers = scopedVolunteers.length;
        const categories = scopedReports.reduce((acc, report) => {
            const key = report.issueType || 'Other';
            const entry = acc.find((item) => item._id === key);
            if (entry) {
                entry.count += 1;
            } else {
                acc.push({ _id: key, count: 1 });
            }
            return acc;
        }, []);

        const reportsTrend = scopedReports.reduce((acc, report) => {
            const key = new Date(report.createdAt || Date.now()).toISOString().slice(0, 10);
            const entry = acc.find((item) => item._id === key);
            if (entry) {
                entry.count += 1;
            } else {
                acc.push({ _id: key, count: 1 });
            }
            return acc;
        }, []).sort((a, b) => a._id.localeCompare(b._id));

        const topUrgent = scopedReports
            .filter((report) => report.status === 'Pending')
            .sort((a, b) => Number(b.urgency) - Number(a.urgency))
            .slice(0, 5);

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
