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
        console.log('Incoming Report Submission:', JSON.stringify(req.body, null, 2));
        let reportData = req.body;
        let aiResponse = null;

        if (req.body.isUnstructured && req.body.text) {
            console.log('Processing unstructured report with AI...');
            const aiData = await groqService.parseUnstructuredText(req.body.text);
            reportData = { ...reportData, ...aiData };
            aiResponse = buildAiResponse(aiData);
        } else {
            if (!reportData.description || !reportData.description.trim()) {
                console.warn('Validation Failed: Missing description');
                return res.status(400).json({ success: false, message: 'Description is required' });
            }
            if (!reportData.issueType) {
                console.warn('Validation Failed: Missing issueType');
                return res.status(400).json({ success: false, message: 'Issue type is required' });
            }
            if (!reportData.location || !reportData.location.coordinates || !reportData.location.address) {
                console.warn('Validation Failed: Incomplete location data');
                return res.status(400).json({ success: false, message: 'Location with coordinates and address is required' });
            }

            // Ensure coordinates are numbers
            reportData.location.coordinates = reportData.location.coordinates.map(Number);
            if (reportData.location.coordinates.some(isNaN)) {
                console.warn('Validation Failed: Invalid coordinates');
                return res.status(400).json({ success: false, message: 'Invalid coordinates' });
            }
        }

        console.log('Saving report to store... (Mongo Ready:', localStore.isMongoReady() + ')');
        const report = await localStore.createReport(reportData, Report);

        console.log('Report created successfully:', report._id);
        res.status(201).json({
            success: true,
            message: 'Report created successfully',
            data: report,
            aiResponse
        });
    } catch (error) {
        console.error('Report Creation Error:', error);
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
