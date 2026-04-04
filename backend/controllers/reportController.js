const Report = require('../models/Report');
const groqService = require('../services/groqService');
const matchingEngine = require('../services/matchingEngine');
const Volunteer = require('../models/Volunteer');
const localStore = require('../services/localStore');

const buildAiResponse = (parsedData = {}) => {
    const issueType = parsedData.issueType || 'Other';
    const urgency = parsedData.urgency || 5;
    const address = parsedData.location?.address || 'Unknown location';
    const summary = parsedData.description || 'No summary available.';

    return `AI Summary: ${issueType} issue at ${address}. Urgency: ${urgency}/10. ${summary}`;
};

exports.createReport = async (req, res) => {
    try {
        let reportData = req.body;
        let aiResponse = null;

        if (req.body.isUnstructured && req.body.text) {
            const aiData = await groqService.parseUnstructuredText(req.body.text);
            reportData = { ...reportData, ...aiData };
            aiResponse = buildAiResponse(aiData);
        } else {
            if (!reportData.description || !reportData.description.trim()) {
                return res.status(400).json({ success: false, message: 'Description is required' });
            }
            if (!reportData.issueType) {
                return res.status(400).json({ success: false, message: 'Issue type is required' });
            }
            if (!reportData.location || !reportData.location.coordinates || !reportData.location.address) {
                return res.status(400).json({ success: false, message: 'Location with coordinates and address is required' });
            }
        }

        const report = await localStore.createReport(reportData, Report);

        res.status(201).json({
            success: true,
            message: 'Report created successfully',
            data: report,
            aiResponse
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getReports = async (req, res) => {
    try {
        const reports = await localStore.listReports(Report);
        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMatchesForReport = async (req, res) => {
    try {
        const report = await localStore.findReportById(req.params.reportId, Report);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        const volunteers = await localStore.listVolunteers(Volunteer);
        const matches = matchingEngine.calculateMatches(report, volunteers);

        res.status(200).json({ success: true, data: matches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
